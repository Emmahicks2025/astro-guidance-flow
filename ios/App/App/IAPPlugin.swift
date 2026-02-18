import Foundation
import Capacitor
import StoreKit

@objc(IAPPlugin)
public class IAPPlugin: CAPPlugin, CAPBridgedPlugin, SKPaymentTransactionObserver, SKProductsRequestDelegate {

    public let identifier = "IAPPlugin"
    public let jsName = "IAPPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise)
    ]

    private var productsRequest: SKProductsRequest?
    private var pendingCall: CAPPluginCall?
    private var fetchedProducts: [String: SKProduct] = [:]

    override public func load() {
        SKPaymentQueue.default().add(self)
    }

    deinit {
        SKPaymentQueue.default().remove(self)
    }

    // MARK: – JS-callable methods

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("Missing productId")
            return
        }

        pendingCall = call

        // Fetch the product first, then buy it
        let request = SKProductsRequest(productIdentifiers: [productId])
        request.delegate = self
        productsRequest = request
        request.start()
    }

    @objc func restorePurchases(_ call: CAPPluginCall) {
        pendingCall = call
        SKPaymentQueue.default().restoreCompletedTransactions()
    }

    // MARK: – SKProductsRequestDelegate

    public func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        guard let product = response.products.first else {
            pendingCall?.reject("Product not found in App Store Connect. Check your product IDs.")
            pendingCall = nil
            return
        }

        fetchedProducts[product.productIdentifier] = product
        let payment = SKPayment(product: product)
        SKPaymentQueue.default().add(payment)
    }

    public func request(_ request: SKRequest, didFailWithError error: Error) {
        pendingCall?.reject("Failed to fetch product: \(error.localizedDescription)")
        pendingCall = nil
    }

    // MARK: – SKPaymentTransactionObserver

    public func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for tx in transactions {
            switch tx.transactionState {
            case .purchased:
                let data: [String: Any] = [
                    "productId": tx.payment.productIdentifier,
                    "transactionId": tx.transactionIdentifier ?? "",
                    "receipt": receiptBase64() ?? ""
                ]
                pendingCall?.resolve(data)
                pendingCall = nil
                queue.finishTransaction(tx)

            case .restored:
                let data: [String: Any] = [
                    "productId": tx.payment.productIdentifier,
                    "transactionId": tx.original?.transactionIdentifier ?? tx.transactionIdentifier ?? "",
                    "receipt": receiptBase64() ?? ""
                ]
                pendingCall?.resolve(data)
                pendingCall = nil
                queue.finishTransaction(tx)

            case .failed:
                let errMsg = tx.error?.localizedDescription ?? "Purchase failed"
                pendingCall?.reject(errMsg)
                pendingCall = nil
                queue.finishTransaction(tx)

            case .deferred, .purchasing:
                break

            @unknown default:
                break
            }
        }
    }

    // MARK: – Helpers

    private func receiptBase64() -> String? {
        guard let url = Bundle.main.appStoreReceiptURL,
              FileManager.default.fileExists(atPath: url.path),
              let data = try? Data(contentsOf: url) else { return nil }
        return data.base64EncodedString()
    }
}
