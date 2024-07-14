// iframeが読み込まれたことを確認する関数
function waitForIframe(iframe, callback) {
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  if (doc.readyState === 'complete') {
    callback();
  } else {
    setTimeout(() => waitForIframe(iframe, callback), 100);
  }
}

// キーボードイベントをシミュレートする関数
function simulateKeyPress(iframe, keyCode) {
  const event = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: keyCode
  });
  iframe.contentDocument.dispatchEvent(event);
}

// 個別のiframeに対してナビゲーションをセットアップする関数
function setupSingleSlideNavigation(iframe) {
  // オーバーレイ要素を作成
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.zIndex = '1000';

  // 左右の領域を作成
  const leftHalf = document.createElement('div');
  leftHalf.style.position = 'absolute';
  leftHalf.style.top = '0';
  leftHalf.style.left = '0';
  leftHalf.style.width = '50%';
  leftHalf.style.height = '100%';
  leftHalf.style.cursor = 'pointer';

  const rightHalf = document.createElement('div');
  rightHalf.style.position = 'absolute';
  rightHalf.style.top = '0';
  rightHalf.style.right = '0';
  rightHalf.style.width = '50%';
  rightHalf.style.height = '100%';
  rightHalf.style.cursor = 'pointer';

  // クリックイベントを追加
  leftHalf.addEventListener('click', () => {
    simulateKeyPress(iframe, 37); // 左矢印キーのキーコード
  });

  rightHalf.addEventListener('click', () => {
    simulateKeyPress(iframe, 39); // 右矢印キーのキーコード
  });

  // オーバーレイに左右の領域を追加
  overlay.appendChild(leftHalf);
  overlay.appendChild(rightHalf);

  // iframeの親要素にオーバーレイを追加
  iframe.parentNode.appendChild(overlay);

  // タッチデバイス用のイベントリスナーを追加
  let xDown = null;
  let yDown = null;

  function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
  }

  function handleTouchMove(evt) {
    if (!xDown || !yDown) {
      return;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        // 左スワイプ
        simulateKeyPress(iframe, 39); // 右矢印キーのキーコード
      } else {
        // 右スワイプ
        simulateKeyPress(iframe, 37); // 左矢印キーのキーコード
      }
    }

    xDown = null;
    yDown = null;
  }

  overlay.addEventListener('touchstart', handleTouchStart, false);
  overlay.addEventListener('touchmove', handleTouchMove, false);

  console.log('Slide navigation setup complete for iframe:', iframe.src);
}

// メイン関数
function setupAllSlideNavigations() {
  // すべてのGoogle Slides iframeを取得
  const iframes = document.querySelectorAll('iframe[src*="docs.google.com/presentation"]');

  if (iframes.length === 0) {
    console.error('No Google Slides iframes found');
    return;
  }

  // 各iframeに対してセットアップを実行
  iframes.forEach(iframe => {
    waitForIframe(iframe, () => setupSingleSlideNavigation(iframe));
  });
}

// DOMContentLoadedイベントでセットアップ関数を呼び出す
document.addEventListener('DOMContentLoaded', setupAllSlideNavigations);