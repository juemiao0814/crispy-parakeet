<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>后台登录 · 礼诚天下</title>
<link rel="stylesheet" href="../css/style.css">
</head>
<body>

<header class="apply-header">
  <div class="brand">
    <span class="seal">礼</span>
    <div class="wordmark">
      <span class="company-cn">礼诚天下</span>
      <span class="tagline">管理后台</span>
    </div>
  </div>
  <a class="back-link" href="../index.html">← 返回首页</a>
</header>

<div class="form-page" style="max-width:420px;">
  <p class="form-eyebrow">后台管理</p>
  <h1>登录</h1>
  <p class="form-sub">仅限授权管理人员使用</p>

  <div class="form-box">
    <form action="check.php" method="post">
      <div class="field">
        <label for="username">账号</label>
        <input id="username" name="username" required>
      </div>
      <div class="field">
        <label for="password">密码</label>
        <input id="password" type="password" name="password" required>
      </div>
      <button type="submit">登录</button>
    </form>
  </div>
</div>

<footer class="site-footer">
  <div class="footer-brand">礼诚天下</div>
  <p class="copyright">© 2026 礼诚天下 Li Cheng Tian Xia. All rights reserved.</p>
</footer>

</body>
</html>
