# POWERSHELL

## 批量重命名

~~~powershell
# 正则六位日期（适用范围000101-291231）
# (?![0-2][1235679]0229) //先行否定平年0229
# [0-2][0-9] //00年到29年
# ((01|03|05|07|08|10|12)(0[1-9]|[12][0-9]|3[01])) //大月
# ((04|06|09|11)(0[1-9]|[12][0-9]|30)) //(除2月以外的)小月
# (02(0[1-9]|[12][0-9])) //2月
$pattern = "^(?![0-2][1235679]0229)[0-2][0-9](((01|03|05|07|08|10|12)(0[1-9]|[12][0-9]|3[01]))|((04|06|09|11)(0[1-9]|[12][0-9]|30))|(02(0[1-9]|[12][0-9])))$"

ls *.txt | %{
$arr = $_.BaseName.split('_')
$res = $arr[1],$arr[0] + $arr[2..($arr.count-1)] -join '_'
if($arr.count -eq 3 -and $arr[0] -match $regex) {ren $_ -NewName "$res.txt"}
}
~~~

# Alias
## google
md C:\Users\〇〇〇〇\documents\WindowsPowerShell

Microsoft.PowerShell_profile.ps1

~~~powershell
Set-Alias google "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
function ggl(){
    google "https://www.google.com/search?q=$args"
}
~~~

Get-ExecutionPolicy/Set-ExecutionPolicy/RemoteSigned
