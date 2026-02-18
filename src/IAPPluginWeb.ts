import { WebPlugin } from '@capacitor/core';

export interface IAPPluginInterface {
    purchase(options: { productId: string }): Promise<{ productId: string; transactionId: string; receipt: string }>;
    restorePurchases(): Promise<{ productId: string; transactionId: string; receipt: string }>;
}

export class IAPPluginWeb extends WebPlugin implements IAPPluginInterface {
    async purchase(options: { productId: string }): Promise<{ productId: string; transactionId: string; receipt: string }> {
        console.log('IAPPluginWeb purchase', options);
        throw new Error('IAP not available on web');
    }
    async restorePurchases(): Promise<{ productId: string; transactionId: string; receipt: string }> {
        console.log('IAPPluginWeb restorePurchases');
        throw new Error('IAP not available on web');
    }
}
