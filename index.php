<?php session_start(); if(!$_SESSION['admin'])header('Location:login.php');?>
<h1>招商CRM后台</h1>
<a href='customer.php'>客户管理</a>