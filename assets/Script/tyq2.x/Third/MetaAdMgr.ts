// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { GCtrl } from "../../../Script/Core/GCtrl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MetaAdMgr extends cc.Component {
    private _androidClass = "org/cocos2dx/javascript/MetaAdMgr";
    private static _instance: MetaAdMgr = null;
    public static getInstance() {
        if (this._instance == null) {
            this._instance = new this();
        }
        return this._instance;
    }
    public static get ins() {
        return this.getInstance();
    }

    private rewardID = 999000000; // 激励视频广告id
    private fullID = 999000001; // 全屏视频广告id
    private bannerID = 999000002; // banner广告id
    private interstitialID = 999000003; // 插屏广告id
    private curEvent = "";

    public init() {
        jsb.reflection.callStaticMethod(this._androidClass, "init", '()V');
    }
    private onInit(isSuccess: boolean) {
        console.log("meta ad init:" + isSuccess);
    }

    /**
     * 播放激励视频
     * @param pos 位置
     */
    public showVideoAd(event: string) {
        // ts调用android原生，注意签名
        jsb.reflection.callStaticMethod(this._androidClass, "showVideoAd", '(I)V', this.rewardID);
        this.curEvent = event;
    }
    /**
     * 是否播放成功
     * @param isSuccess 
     */
    private onAdShow(isSuccess: boolean) {
        console.log("meta ad is show:" + isSuccess);
        if (!isSuccess) {
            GCtrl.ES.emit(this.curEvent, false);
        }
    }
    /**
     * 点击广告
     */
    private onAdClick() {
        console.log("meta ad is click");
    }
    /**
     * 关闭广告
     */
    private onAdClose() {
        console.log("meta ad is close");
        // GCtrl.ES.emit(this.curEvent, false);
    }
    /**
     * 跳过广告
     */
    private onAdClickSkip() {
        console.log("meta ad is skip");
        // GCtrl.ES.emit(this.curEvent, false);
    }
    /**
     * 发放激励
     */
    private onAdReward() {
        console.log("meta ad is reward");
        GCtrl.ES.emit(this.curEvent, true);
    }

    /**
     * 播放插屏广告
     */
    public showInterstitialAd() {
        jsb.reflection.callStaticMethod(this._androidClass, "showInterstitialAd", '(I)V', this.interstitialID);
    }
    /**
     * 是否展示成功
     * @param isSuccess 
     */
    private onInterstitialAdShow(isSuccess: boolean) {

    }
    /**
     * 广告被点击
     */
    private onInterstitialAdClick() {

    }
    /**
     * 广告被关闭
     */
    private onInterstitialAdClose() {

    }

    /**
     * 播放banner广告
     */
    public showBannerAd() {
        jsb.reflection.callStaticMethod(this._androidClass, "showBannerAd", '(I)V', this.bannerID);
    }
    /**
     * 广告是否展示成功
     * @param isSuccess 
     */
    private onBannerAdShow(isSuccess: boolean) {

    }
    /**
     * 广告被点击
     */
    private onBannerAdClick() {

    }
    /**
     * 广告被关闭
     */
    private onBannerAdClose() {

    }

    /**
     * 关闭banner广告
     */
    public closeBannerAd() {
        jsb.reflection.callStaticMethod(this._androidClass, "closeBannerAd", '()V');
    }

    /**
     * 广告个性化推荐开关
     * @param isOpen 
     */
    public setPersonalRecommendAd(isOpen: boolean) {
        jsb.reflection.callStaticMethod(this._androidClass, "setPersonalRecommendAd", '(Z)V', isOpen);
    }

}

window["MetaAdMgr"] = MetaAdMgr;
