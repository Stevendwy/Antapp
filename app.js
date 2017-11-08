App({
  onLaunch(options) {
    // console.log('App Launch', options);
    // console.log('getSystemInfoSync', my.getSystemInfoSync());
    // console.log('SDKVersion', my.SDKVersion);
    my.getAuthCode({
      scopes: 'auth_base',
      success: (res) => {
        // my.alert({
        //   content: res.authCode,
        // });
        my.getAuthUserInfo({
          success: (userInfo) => {
            console.log(userInfo)
            // my.alert({
            //   content: userInfo
            // });
          }
        });
      },
    });
  },
  onShow() {
    // console.log('App Show');
  },
  onHide() {
    // console.log('App Hide');
  },
  globalData: {
    hasLogin: false,
  },
});
