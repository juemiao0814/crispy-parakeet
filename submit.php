<?php
include 'connect.php';
$sql="INSERT INTO customer(name,gender,phone,wechat,whatsapp,type,product)
VALUES('$_POST[name]','$_POST[gender]','$_POST[phone]','$_POST[wechat]','$_POST[whatsapp]','$_POST[type]','$_POST[product]')";
if(mysqli_query($conn,$sql)){header('Location:success.php');}
else{echo '提交失败';}
?>