package jp.co.headwaters.littlemanpiss;

import jp.co.cayto.appc.sdk.android.AppC;
import jp.co.cayto.appc.sdk.android.AppC.OnAppCCutinListener;
import jp.co.cayto.appc.sdk.android.AppCSimpleView;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.LinearLayout;

public class MainActivity extends Activity implements OnAppCCutinListener {

    private static final String URL = "file:///android_asset/Little_man_piss.html";
    private WebView webView;
    private String databasePath;
    private AppCSimpleView adLayout;
    private LinearLayout adLayoutCutin;
    private AppC appc;

    @SuppressLint("SetJavaScriptEnabled")
    @SuppressWarnings("deprecation")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        databasePath = this.getApplicationContext()
                .getDir("localstorage", Context.MODE_PRIVATE).getPath();
        webView = (WebView) findViewById(R.id.webView);

        webView.getSettings().setJavaScriptEnabled(true);
        webView.loadUrl(URL);

        // //////////////// webViewの各種設定/////////////////
        webView.getSettings().setBuiltInZoomControls(true);
        webView.getSettings().setSupportZoom(true);
        webView.setVerticalScrollbarOverlay(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabasePath(databasePath);

        // ///////////////広告を非表示にするため//////////////////
        JsObject jsObj = new JsObject();
        webView.addJavascriptInterface(jsObj, "andjs");
        adLayout = (AppCSimpleView) findViewById(R.id.adLayout);
        adLayoutCutin = (LinearLayout) findViewById(R.id.adLayoutCutin);

        // //////////////カットイン型広告/////////////////
        appc = new AppC(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        // カットイン初期化
        appc.initCutin();
    }

    public class JsObject {

        // 広告の表示
        @JavascriptInterface
        public void showAd() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    adLayout.setVisibility(View.VISIBLE);
                }
            });
        }

        // 広告の非表示
        @JavascriptInterface
        public void hideAd() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    adLayout.setVisibility(View.INVISIBLE);
                }
            });
        }

        // カットイン
        @JavascriptInterface
        public void cutinAd() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    appc.callCutin();
                    // adLayoutCutin.setVisibility(View.INVISIBLE);
                }
            });
        }
    }

    @Override
    public void onCutinFinish() {
        // adLayoutCutin.setVisibility(View.GONE);

    }

    @Override
    public void onCutinOpen() {
        // TODO Auto-generated method stub

    }

    @Override
    public void onCutinClose() {
        // adLayoutCutin.setVisibility(View.GONE);
    }
}
