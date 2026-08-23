function submitForm(){alert("提交成功！我们会尽快联系您");}
function ai(){document.getElementById("reply").innerHTML="AI：已记录您的招商需求";}
function login(){if(document.getElementById("user").value=="admin"&&document.getElementById("pass").value=="123456"){document.getElementById("tip").innerHTML="登录成功"}else{document.getElementById("tip").innerHTML="账号或密码错误"}}