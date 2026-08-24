<?php
session_start();
include '../php/connect.php';
$r=mysqli_query($conn,"SELECT * FROM admin WHERE username='$_POST[username]' AND password='$_POST[password]'");
if(mysqli_num_rows($r)>0){$_SESSION['admin']=1;header('Location:index.php');}
else{echo '账号密码错误';}
?>