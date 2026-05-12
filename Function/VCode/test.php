<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "1. GD 库状态: " . (extension_loaded('gd') ? '已安装' : '未安装') . "<br>";
echo "2. GD 版本: " . (function_exists('gd_info') ? gd_info()['GD Version'] : '未知') . "<br>";
echo "3. imagettftext 函数: " . (function_exists('imagettftext') ? '可用' : '不可用') . "<br>";

$fontPath = dirname(__FILE__) . '/ttf/Mirvoshar.ttf';
echo "4. 字体文件路径: " . $fontPath . "<br>";
echo "5. 字体文件存在: " . (file_exists($fontPath) ? '是' : '否') . "<br>";

if (file_exists($fontPath)) {
    echo "6. 字体文件大小: " . filesize($fontPath) . " 字节<br>";
    echo "7. 字体文件可读: " . (is_readable($fontPath) ? '是' : '否') . "<br>";
}

// 列出 ttf 目录内容
$ttfDir = dirname(__FILE__) . '/ttf';
if (is_dir($ttfDir)) {
    echo "8. ttf 目录内容: <br>";
    $files = scandir($ttfDir);
    foreach ($files as $file) {
        if ($file != '.' && $file != '..') {
            echo "   - " . $file . "<br>";
        }
    }
} else {
    echo "8. ttf 目录不存在！<br>";
}
?>