/**
 * 加载界面
 */
import MaskProgressBar from "../../../Core/FrameEx/CCMaskProgressBar";
import GViewBase from "../../../Core/GView/GViewBase";
import { L } from '../../Common/Language';
import { VIEW_ID } from "../../Common/UI";
import GameMgr from '../../Logic/GameMgr';
import { JXDef } from "./../../../conventions/JXCommon";
import { WinPage } from './../../../Core/CoreDefine';
import { GCtrl } from './../../../Core/GCtrl';
import { UIMgr } from './../../../Core/Manager/UIMgr';
import { Res } from './../../Common/UIResources';
import { JXLocales } from './../../Common/Zh';

const { ccclass, property } = cc._decorator;

interface LoadConfigRaw {
    start?: number;
    loginRaw?: number;
    loginStatic?: number;
    loginAciton?: number;
    gameRaw?: number;
    gameStatic?: number
    otherStatic?: number;
    userData?: number;
}

// 加载权重
const PROCESS_CONFIGS = {
    newAccountLogin: {
        start: 0.5,
        loginRaw: 0.1,
        loginStatic: 0.1,
        loginAciton: 0.1,
        gameRaw: 0.1,
        gameStatic: 0.05,
        userData: 0.05,
    } as LoadConfigRaw,
    oldLogin: {
        start: 0.5,
        loginRaw: 0.25,
        loginStatic: 0.25
    } as LoadConfigRaw,
    oldGame: {
        gameRaw: 0.3,
        gameStatic: 0.4,
        userData: 0.3,
    } as LoadConfigRaw,
}


@ccclass
export default class LoadCtrl extends GViewBase {
    /**加载进度文本 */
    @property(cc.Label) progressLabel: cc.Label = null;
    /**加载进度条 */
    @property(MaskProgressBar) progressBar: MaskProgressBar = null;
    @property(cc.Texture2D) texture_login: cc.Texture2D = null;
    // 已使用进度
    public useProgress: number = 0;
    // 当前进度
    public curProgress: number = 0;
    protected _curLoadConfig: LoadConfigRaw = null;
    private loadNum: number = 0;

    onGLoad() {
        if (this.progressBar) this.progressBar.progress = 0;
        if (this.progressLabel) this.progressLabel.string = "";

        this.startLoad();
    }

    protected startLoad() {
        this._curLoadConfig = PROCESS_CONFIGS.oldLogin;
        this.useProgress = this._curLoadConfig.start;
        this.curProgress = this._curLoadConfig.loginRaw;
        /**分包加载 */
        this.loadPackage(JXDef.bundle.first, () => {
            GameMgr.initSimulator();
            GameMgr.initLogicManager();
            this.preLoadGameStart();
        });
    }

    /**加载资源开始 */
    protected preLoadGameStart() {
        this.setLoadText(L(JXLocales.load.assetLoad));
        this.setLoadProgress(this.useProgress);
        // 预加载不希望用的时候异步的预制件
        GCtrl.preLoadRawAssets((curIndex: number, total: number, asset) => {
            this.setLoadText(L(JXLocales.load.process, curIndex, total));
            this.setLoadProgress(this.useProgress + curIndex / total * this.curProgress);
        }, () => {
            this.loadloginStatic();
        },
            ...Object.keys(Res.material).map((v, k) => { return { type: cc.Material, path: Res.material[v] } }),
            { type: cc.SpriteFrame, path: Res.texture.single },
            { type: cc.Prefab, path: Res.prefab.vw.tip.wait },
            { type: cc.Prefab, path: Res.prefab.vw.tip.toast },
        );
    }

    /**初始化静态配置 */
    protected loadloginStatic() {
        this.useProgress += this.curProgress; // 0.5 +0.2; 0.5 + 0.4
        this.curProgress = this._curLoadConfig.loginStatic; //0.5 +0.2 +0.2; 0.5 +0.4 
        GameMgr.initLoginStatic((cur, total) => {
            this.setLoadText(L(JXLocales.load.static, cur, total));
            this.setLoadProgress(this.useProgress + this.curProgress * cur / total)
        }, () => {
            //#region 
            this.loadGameStatic();
            this._curLoadConfig = PROCESS_CONFIGS.oldGame;
        })
    }

    /**加载静态资源 */
    protected loadGameStatic() {
        this.useProgress += this.curProgress;
        this.curProgress = this._curLoadConfig.gameStatic;
        GameMgr.initFristGameStatics((cur, total) => {
            this.setLoadText(L(JXLocales.load.static, cur, total));
            this.setLoadProgress(this.useProgress + cur / total * this.curProgress);
        }, () => {
            this.loadHomeCtrl();

        })
    }

    /**加载home界面 */
    protected loadHomeCtrl() {
        this.setLoadText(L(JXLocales.load.enter_game));
        GameMgr.ins().initGame();
        // 预加载主场景资源：
        GCtrl.preLoadRawAssets(null, () => {
            this.endLoadHomeCtrl();
        },
            { type: cc.Prefab, path: Res.prefab.vw.home.powerItem },
            { type: cc.Prefab, path: Res.prefab.vw.home.homeCtrl },
        );
    }

    /**所有数据加载完成进入游戏 */
    protected endLoadHomeCtrl() {
        GameMgr.sdkMgr.umaSetPoint(JXDef.umaPoint.inGameScene);
        UIMgr.showWin(VIEW_ID.home, WinPage.Page2);
        this.onClose();
        GCtrl.ES.emit(GCtrl.GClientWinOpenEventMsg);

    }

    protected setLoadText(text: string) {
        if (!this.progressLabel) return;
        this.progressLabel.string = text;
    }

    protected setLoadProgress(val: number) {
        if (!this.progressBar) return;
        this.progressBar.progress = Math.min(val, 1);

    }

    /**加载分包 */
    protected loadPackage(bundles, cb) {
        this.setLoadText(L(JXLocales.load.loadPackage));
        let keys = Object.keys(bundles);
        if (keys.length == 0) {
            cb();
            return;
        }
        const str = bundles[keys[this.loadNum]];
        cc.assetManager.loadBundle(str, (err: Error, boule: cc.AssetManager.Bundle) => {
            if (err) {
                cc.error("分包加载失败:" + str);
            } else {
                cc.log("分包加载成功:" + str)
            }
            this.loadNum++;
            this.setLoadProgress(this.loadNum / keys.length);
            if (this.loadNum < keys.length) {
                this.loadPackage(bundles, cb);
            } else {
                this.loadNum = 0;
                cb()
            }
        });
    }
}



