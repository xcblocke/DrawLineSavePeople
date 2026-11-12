

//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
export default class SdkMgr {

    private static _ins

    public static ins() {
        if (this._ins == null) {
            this._ins = new SdkMgr()
        }
        return this._ins
    }


    public umaSetPoint(value) {

    }


    public initGame() {

    }

    public loginOut() {

    }

    public watchAd(cb, cb2) {
        cb && cb()
    }

    public isDefault() {
        return true
    }
}