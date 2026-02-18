import Foundation
import StoreKit
import Capacitor

@objc(IAPPlugin)
public class IAPPlugin: CAPPlugin, SKPaymentTransactionObserver, SKProductsRequestDelegate {
    
    var productsRequest: SKProductsRequest?
    var products = [SKProduct]()
    var purchaseCommand: CAPPluginCall?

    public override func load() {
        SKPaymentQueue.default().add(self)
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("Product ID is required")
            return
        }
        
        self.purchaseCommand = call
        
        let request = SKProductsRequest(productIdentifiers: Set([productId]))
        request.delegate = self
        request.start()
    }
    
    @objc func restorePurchases(_ call: CAPPluginCall) {
        self.purchaseCommand = call
        SKPaymentQueue.default().restoreCompletedTransactions()
    }
    
    public func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        if let product = response.products.first {
            let payment = SKPayment(product: product)
            SKPaymentQueue.default().add(payment)
        } else {
            purchaseCommand?.reject("Product not found: \(response.invalidProductIdentifiers)")
        }
    }
    
    public func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchased:
                handlePurchased(transaction)
            case .restored:
                handleRestored(transaction)
            case .failed:
                handleFailed(transaction)
            case .deferred, .purchasing:
                break
            @unknown default:
                break
            }
        }
    }
    
    func handlePurchased(_ transaction: SKPaymentTransaction) {
        guard let call = purchaseCommand else { return }
        
        if let appStoreReceiptURL = Bundle.main.appStoreReceiptURL,
           let receiptData = try? Data(contentsOf: appStoreReceiptURL) {
            let receiptString = receiptData.base64EncodedString(options: [])
            
            call.resolve([
                "transactionId": transaction.transactionIdentifier ?? "",
                "productId": transaction.payment.productIdentifier,
                "receipt": receiptString
            ])
        } else {
            call.reject("Receipt not found")
        }
        
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
    func handleRestored(_ transaction: SKPaymentTransaction) {
        // Simple restore logic - just return success for now
        // In a real app, you might want to return a list of restored products
        guard let call = purchaseCommand else { return }
        
        if let appStoreReceiptURL = Bundle.main.appStoreReceiptURL,
           let receiptData = try? Data(contentsOf: appStoreReceiptURL) {
            let receiptString = receiptData.base64EncodedString(options: [])
            
            call.resolve([
                "transactionId": transaction.transactionIdentifier ?? "",
                "productId": transaction.payment.productIdentifier,
                "receipt": receiptString
            ])
        }
        
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
    func handleFailed(_ transaction: SKPaymentTransaction) {
        guard let call = purchaseCommand else { return }
        
        if let error = transaction.error {
            call.reject(error.localizedDescription)
        } else {
            call.reject("Transaction failed")
        }
        
        SKPaymentQueue.default().finishTransaction(transaction)
    }
}
