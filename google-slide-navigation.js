// iframeが読み込まれたことを確認する関数
function waitForIframe(iframe, callback) {
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  if (doc.readyState === 'complete') {
    callback();
  } else {
    setTimeout(() => waitForIframe(iframe, callback), 100);
  }
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
    iframe.contentWindow.postMessage('{"action":"prev"}', '*');
  });

  rightHalf.addEventListener('click', () => {
    iframe.contentWindow.postMessage('{"action":"next"}', '*');
  });

  // オーバーレイに左右の領域を追加
  overlay.appendChild(leftHalf);
  overlay.appendChild(rightHalf);

  // iframeの親要素にオーバーレイを追加
  iframe.parentNode.appendChild(overlay);

  // タッチデバイス用のイベントリスナーを追加
  let xDown = null;

  function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
  }

  function handleTouchEnd(evt) {
    if (!xDown) {
      return;
    }

    const xUp = evt.changedTouches[0].clientX;
    const xDiff = xDown - xUp;

    if (Math.abs(xDiff) > 50) { // スワイプの距離が50px以上の場合
      if (xDiff > 0) {
        // 左スワイプ
        iframe.contentWindow.postMessage('{"action":"next"}', '*');
      } else {
        // 右スワイプ
        iframe.contentWindow.postMessage('{"action":"prev"}', '*');
      }
    }

    xDown = null;
  }

  overlay.addEventListener('touchstart', handleTouchStart, false);
  overlay.addEventListener('touchend', handleTouchEnd, false);

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