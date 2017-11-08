var mdfive = require('../../util/md5.js');
var util = require('../../util/util.js');
const app = getApp();
Page({
  data: {
      phoneNumber:"",               //拨打电话
      textareavalue: "",            //textarea 输入内容
      storehas:[],                  //是否新加仓库
      ajaxallow:false,              //是否允许再次请求数据

      sellmarket: [],         //供货市场
      selllefttitle: ["供应商", "联系电话","库存"],
      sellrightlist: ["merchant_name", "merchant_phone", "stock_status"],
      selldataend:1,                  //供货市场数据是否最后页码
      selldatapage:1,                //默认供货市场请求页码

      buymarket: [],                  //需求市场
      buylefttitle: ["客户", "求购零件号", "联系电话"],
      buyrightlist: ["buyer_name", "pid", "buyer_phone"],
      buydataend: 1,            //需求市场数据是否最后页码
      buydatapage:1,                //默认默认需求请求页码

      userInfo: {},
      hasUserInfo: false,
      hasuid:"",                    //存储openid
      hasphone:0,                    //存储手机号
      brandlist:[],                   //存储的品牌
      storebrand:"",
      newbrand:"",                     //仅供发参数
      toView: "gomessage",            //判断显示那个页面
      clickindex:0,                   //判断显示那个页面 index

      clickid: ["gomessage", "goprice", "goreplace", "gomodule","goteach","gotechnology"],
      dataMes:[],
      dataPrice:[],
      dataReplace:[],
      dataModule:[],
      dataTeach:[],
      dataTechnology:[],

      leftlist: ["零件类型:", "厂家:", "说明:", "地区:", "库存:", "销售价:","供货商:"],
      rightlist: ["parttype", "mill", "remark", "location", "amount", "prices", "supplier"],

      replacelist: ["品牌:", "零件号:", "车型:", "件数:", "型号:", "参考价格:"],
      replacerightlist: ["brandcn", "pid", "ptype", "counts", "lable", "prices"],

      modulelist: ["位置:", "零件号:", "名称:", "型号:", "备注:", "件数:"],
      modulerightlist: ["id", "pid", "label", "model", "remark", "num"],

      technologylist: ["车型:", "市场:", "年份:","零件组:"],
      technologyrightlist: ["cars_model", "market", "year", "group_name"],

      headlist: [],
      logoimg:"",
      imgbrand:"",                          //品牌图片
      imgbottom: "../../images/p_img.png",
      
      input_focus: true,
      inputclear: false,
      inputdata: "",
      savehistory: ["95820102100", "64319313519", "24007621038", "12317605061","12317605478"],
      history: ["95820102100", "64319313519", "24007621038", "12317605061","12317605478"],
      bookmark: ['速度慢', '价格不准确', '需要添加供应商信息', '数据不全','需要添加求购零件信息','数据错误','联系方式不准确'],

      searched:false,
      getresult:false,
      manybrand:false
  },
  inputchange(e) {
        let s_input = e.detail.value.replace(/[^a-zA-Z0-9]/g, '').toLocaleUpperCase();
        let s_show = e.detail.value.replace(/\W/g, '').length != 0 ? true : false;
        this.setData({
            inputdata: s_input,
            inputclear: s_show
        });
        if (s_show == false) {
            this.setData({
                searched: false,
                getresult: false
            });
        }
    },
    inputfeed (e) {
        let s_input = e.detail.value;
        this.setData({ textareavalue: s_input });
    },
    inputClear (e) {
        this.setData({
            inputdata: '',
            inputclear: false,
            searched: false,
            getresult: false
        });
    },
    goSearch (e) {
        if (this.data.hasuid == '' || this.data.hasphone == 0) {
            this.whetherlogin();
        }
        if (this.data.hasUserInfo != true) {
            let that = this;
            my.showToast({
                title: '请点击用户信息',
                icon: 'loading',
                duration: 2000
            });
            setTimeout( () => {
                my.hideToast();
                // my.openSetting({
                //     success:  (data) => {
                //         if (data.authSetting['scope.userInfo'] == true) {
                //             my.getAuthUserInfo({
                //                 success:  (datw) => {
                //                     app.globalData.userInfo = datw.userInfo;
                //                     that.setData({
                //                         userInfo: datw.userInfo,
                //                         hasUserInfo: true
                //                     });
                //                 },
                //                 fail:  () => {
                //                     console.info('2授权失败返回数据');
                //                 }
                //             });
                //         }
                //     }
                // });
            }, 2000);
        } else {
            let search_input = this.data.inputdata.replace(/[^\w\n]/g, '');
            let that = this;
            if (search_input.length < 1) {
                that.setData({
                    searched: false,
                    getresult: false
                });
                return;
            }
            this.setData({
                dataMes: [],
                dataPrice: [],
                dataReplace: [],
                dataModule: [],
                dataTeach: [],
                dataTechnology: [],
                sellmarket: [],
                selldatapage: 1,
                buymarket: [],
                buydatapage: 1,
                toView: 'gomessage',
                clickindex: 0
            });
            let _obj = util.headAdd('/parts/search');
                _obj.parts = search_input;
                _obj.brand = that.data.storebrand;
            my.httpRequest({
                url: 'https://007vin.com/parts/search',
                data: _obj,
                method: 'post',
                header: { 'Content-Type': 'application/x-www-form-urlencoded' },
                success: (res) => {
                    if (res.data.code == 0) {
                        that.setData({
                            searched: true,
                            getresult: false,
                            manybrand: false
                        });
                    } else if (res.data.code == 6) {
                        that.setData({
                            searched: true,
                            getresult: false,
                            manybrand: true,
                            brandlist: res.data.data
                        });
                    } else {
                        let _savehistory = that.data.savehistory;
                        // let ishav = _savehistory.indexOf(search_input);
                        // if (ishav == -1) {
                        //     _savehistory.unshift(search_input);
                        //     if (_savehistory.length > 5) {
                        //         _savehistory = _savehistory.slice(0, 5);
                        //     }
                        //     my.setStorageSync({
                        //         key: 'savehistory',
                        //         data: _savehistory
                        //     });
                        // }
                        that.setData({
                            searched: true,
                            getresult: true,
                            // savehistory: _savehistory,
                            // history: _savehistory,
                            input_focus: false,
                            storebrand: '',
                            newbrand: res.data.brand
                        });
                        that.dataGet(res.data.brand, search_input);
                        let _obj = util.headAdd('/wechattool/buyer_history_record');
                            _obj.uid_auth = that.data.hasuid;
                            _obj.pid = search_input;
                            _obj.brandCode = res.data.brand;
                            _obj.nickName = that.data.userInfo.nickName;
                            _obj.city = that.data.userInfo.city;
                            _obj.province = that.data.userInfo.province;
                        my.httpRequest({
                            url: 'https://union.007vin.com/wechattool/buyer_history_record',
                            data: _obj,
                            method: 'post',
                            header: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            success: (res)=>{
                            }
                        });
                    }
                }
            });
        }
    },
    inputmark (e) {
        let _data = this.data.textareavalue + e.target.dataset.values + ' \uFF0C';
        this.setData({ textareavalue: _data });
    },
    feedBackBtn (e) {
        if (e.detail.value.textarea.replace(/\s+/g, '').length > 0) {
            let that = this;
            let _obj = util.headAdd('/wechattool/feedback');
            _obj.uid_auth = that.data.hasuid;
            _obj.uid_auth = that.data.hasuid;
            _obj.feedback_content = e.detail.value.textarea;
            _obj.nickName = that.data.userInfo.nickName;
            my.httpRequest({
                url: 'https://union.007vin.com/wechattool/feedback',
                data: _obj,
                method: 'post',
                header: { 'Content-Type': 'application/x-www-form-urlencoded' },
                success: (res) => {
                    my.showToast({
                        title: '问题已经反馈',
                        icon: '',
                        duration: 2000
                    });
                }
            });
            that.setData({ textareavalue: '' });
            // setTimeout(_ => {
            //     that.setData({ textareavalue: '' });
            // }, 300);
        }
    },
    getPhoneNumber (e) {
        let that = this;
        if (e.detail.errMsg != 'getPhoneNumber:fail user deny') {
            that.whetherlogin('phone', e.detail.encryptedData, that.data.hasuid, e.detail.iv);
        }
    },
    getMoreSellMarket () {
        let that = this;
        let _page = 1 + that.data.selldatapage;
        that.getSellMarket(_page);
    },
    phoneNumTap (e) {
        let phonenum = e.currentTarget.dataset.phone;
        let _split = '/';
        let _phone = phonenum.split(_split)[0] || phonenum;
        // my.makePhoneCall({ phoneNumber: _phone });
    },
    getbrand (e) {
        let _brand = e.currentTarget.dataset.brand;
        let that = this;
        that.setData({ storebrand: _brand }, () => {
            that.goSearch();
        });
    },
    getpartnum (e) {
        let that = this
        let message = e.currentTarget.dataset.world;
        that.setData({
            // history: that.data.savehistory,
            input_focus: false,
            inputdata: message,
            inputclear: true
        }, () => {
            that.goSearch();
        });
    },
    scrollToViewFn (e) {
        let _id = e.target.dataset.id;
        let _index = e.target.dataset.index;
        this.setData({
            toView: _id,
            clickindex: _index
        });
    },
    scrollToViewFnBtn (e) {
        let _id = e.target.dataset.id;
        let _index = e.target.dataset.index;
        let that = this;
        if (_index == 11) {
            that.getSellMarket();
        } else if (_index == 12) {
            that.getBuyMarket();
        }
        that.setData({
            toView: _id,
            clickindex: _index
        });
    },
    getSellMarket (page = 1) {
        let that = this;
        that.setData({
            selldatapage: 1,
            selldataend: 1
        });
        let _obj = util.headAdd('/wechattool/merchant_list');
            _obj.uid_auth = that.data.hasuid;
            _obj.brandCode = that.data.newbrand;
            _obj.page = page;
        my.httpRequest({
            url: 'https://union.007vin.com/wechattool/merchant_list',
            data: _obj,
            method: 'post',
            header: { 'Content-Type': 'application/x-www-form-urlencoded' },
            success: (res) => {
                that.setData({
                    ajaxallow: false,
                    sellmarket: res.data.data,
                    selldatapage: res.data.page,
                    selldataend: res.data.last_page
                });
            }
        });
    },
    bindSellMore () {
        let that = this;
        if (that.data.ajaxallow) {
            return;
        }
        that.setData({ ajaxallow: true });
        if (that.data.clickindex == 12 && that.data.buydataend == 0) {
            let _pages = 1 + that.data.buydatapage;
            that.getBuyMarket(_pages);
        }
    },
    getBuyMarket (page = 1) {
        let that = this;
        let _obj = util.headAdd('/wechattool/buyer_list');
        _obj.uid_auth = that.data.hasuid;
        _obj.page = page;
        my.httpRequest({
            url: 'https://union.007vin.com/wechattool/buyer_list',
            data: _obj,
            method: 'post',
            header: { 'Content-Type': 'application/x-www-form-urlencoded' },
            success: (res) => {
                that.setData({
                    ajaxallow: false,
                    storehas: res.data.data,
                    buymarket: res.data.data,
                    buydatapage: res.data.page,
                    buydataend: res.data.last_page
                });
            }
        });
    },
    onLoad (options) {
        let that = this;
        if (options.bindpid) {
            that.setData({
                inputdata: options.bindpid,
                inputclear: true
            }, () => {
                that.goSearch();
            });
        }

        my.getAuthCode({
            scopes: 'auth_base',
            success: (res) => {
                my.alert({
                content: res.authCode,
                });
            },
        });

        my.getStorage({
            key: 'savehistory',
            success: function (res) {
                let _data = res.data || ["95820102100", "64319313519", "24007621038", "12317605061","12317605478"];

                that.setData({
                    history: _data,
                    savehistory: _data
                });
            }
        });

        // that.newgetuserInfo();
        // that.whetherlogin();
    },
    newgetuserInfo () {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        } else if (this.data.canIUse) {
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                });
            };
        } else {
            my.getAuthUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo;
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    });
                }
            });
        }
    },
    dataGet (date, pid) {
        let that = this;
        let _obj = util.headAdd('/ppys/partssearchs');
            _obj.part = pid;
            _obj.brand = date;
        my.httpRequest({
            url: 'https://007vin.com/ppys/partssearchs',
            data: _obj,
            method: 'get',
            header: { 'Content-Type': 'application/x-www-form-urlencoded' },
            success:  (res) => {
                let _titlelist = [
                    '基础信息',
                    '渠道价格',
                    '替换件',
                    '组件',
                    '技术信息',
                    '适用车型'
                ];
                let _data = res.data.headname || [];
                    _data.unshift('基础信息');
                let _clickid = [];
                for (let o = 0; o < _data.length; o++) {
                    let _haveindex = _titlelist.indexOf(_data[o]);
                    if (_haveindex != -1) {
                        let _bugdata = [
                            'gomessage',
                            'goprice',
                            'goreplace',
                            'gomodule',
                            'goteach',
                            'gotechnology'
                        ];
                        _clickid.push(_bugdata[_haveindex]);
                        if (_haveindex != 0 && _haveindex != 4) {
                            that.addDataGet(pid, date, _haveindex);
                        }
                    }
                }
                let _datames = res.data.partdetail;
                if (_datames.length > 0) {
                    _datames.forEach(function (item, index, arr) {
                        arr[index].key = arr[index].key.replace(/&nbsp;/g, '');
                        arr[index].value = arr[index].value.replace(/&nbsp;/g, '');
                    });
                }
                that.setData({
                    clickid: _clickid,
                    headlist: _data,
                    dataMes: _datames,
                    imgbrand: res.data.img,
                    dataTeach: res.data.showmessage || []
                });
            }
        });
    },
    addDataGet (pid, date, index) {
        let that = this;
        let urllist = [
            'ppys/partssearchs',
            'ppys/partprices',
            'ppys/searchreplace',
            'ppys/partcompt',
            '不用该参数',
            'ppys/partcars'
        ];
        let _obj = util.headAdd(urllist[index]);
        _obj.part = pid;
        _obj.brand = date;
        my.httpRequest({
            url: 'https://007vin.com/' + urllist[index],
            data: _obj,
            method: 'get',
            header: { 'Content-Type': 'application/x-www-form-urlencoded' },
            success: (res) => {
                if (index == 1) {
                    that.setData({ dataPrice: res.data.data[0].data || [] });
                } else if (index == 2) {
                    if (res.data.data != []) {
                        that.setData({ dataReplace: res.data.data || [] });
                    }
                } else if (index == 3) {
                    that.setData({ dataModule: res.data.data || [] });
                } else {
                    that.setData({ dataTechnology: res.data.data || [] });
                }
            }
        });
    },
    whetherlogin (types = 'login', phone = '', uid = '', iv = '') {
        let that = this;
        my.getAuthCode({
            success: (loginCode) => {
                if (types == 'phone') {
                    let _objs = util.headAdd('/wechattool/userphone_record');
                        _objs.phone_auth = phone;
                        _objs.uid_auth = uid;
                        _objs.iv = iv;
                        _objs.js_code = loginCode.code;
                        _objs.nickName = that.data.userInfo.nickName;
                        _objs.city = that.data.userInfo.city;
                        _objs.province = that.data.userInfo.province;
                    my.httpRequest({
                        url: 'https://union.007vin.com/wechattool/userphone_record',
                        data: _objs,
                        method: 'post',
                        header: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        success:(res) => {
                            that.setData({ hasphone: res.data.phone_verified }, that.getSellMarket());
                        }
                    });
                } else {
                    let _obj = util.headAdd('/wechattool/userinfo');
                    _obj.js_code = loginCode.code;
                    my.httpRequest({
                        url: 'https://union.007vin.com/wechattool/userinfo',
                        data: _obj,
                        method: 'post',
                        header: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        success: (res) => {
                            that.setData({
                                hasuid: res.data.uid_auth,
                                hasphone: res.data.phone_verified
                            });
                        }
                    });
                }
            }
        });
    },
    onShareAppMessage () {
        return {
            title: '零零汽零件号查询',
            path: '/pages/resule/index?bindpid=' + this.data.inputdata,
            success:(res) =>  {
            }
        };
    },
    getUserInfo (e) {
        app.globalData.userInfo = e.detail.userInfo;
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        });
    }

});
