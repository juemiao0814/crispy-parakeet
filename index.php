<?php session_start(); if(!$_SESSION['admin'])header('Location:login.php');?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>招商CRM后台 · 礼诚天下</title>
<link rel="stylesheet" href="../css/style.css">
</head>
<body>

<header class="apply-header">
  <div class="brand">
    <span class="seal">礼</span>
    <div class="wordmark">
      <span class="company-cn">礼诚天下</span>
      <span class="tagline">招商CRM后台</span>
    </div>
  </div>
  <a class="back-link" href="../index.html">← 返回首页</a>
</header>

<div class="form-page">
  <p class="form-eyebrow">管理后台</p>
  <h1>招商CRM后台</h1>
  <div class="form-box" style="text-align:center;">
    <a class="cta" href="customer.php">客户管理</a>
  </div>
</div>

</body>
</html>
