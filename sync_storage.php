<?php

/**
 * سكريبت لمزامنة ملفات التخزين مع مجلد public
 * يجب تشغيله بعد كل عملية رفع صورة جديدة
 */

echo "=== مزامنة ملفات التخزين ===\n";

$sourceDir = __DIR__ . '/storage/app/public';
$targetDir = __DIR__ . '/public/storage';

// إنشاء مجلد الهدف إذا لم يكن موجوداً
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
    echo "تم إنشاء مجلد الهدف: {$targetDir}\n";
}

// دالة نسخ المجلدات والملفات
function copyDirectory($src, $dst) {
    $dir = opendir($src);
    if (!is_dir($dst)) {
        mkdir($dst, 0755, true);
    }
    
    while (($file = readdir($dir)) !== false) {
        if ($file != '.' && $file != '..') {
            $srcFile = $src . '/' . $file;
            $dstFile = $dst . '/' . $file;
            
            if (is_dir($srcFile)) {
                copyDirectory($srcFile, $dstFile);
            } else {
                copy($srcFile, $dstFile);
                echo "تم نسخ: {$file}\n";
            }
        }
    }
    closedir($dir);
}

// مزامنة الملفات
copyDirectory($sourceDir, $targetDir);

echo "تمت المزامنة بنجاح!\n";
echo "المصدر: {$sourceDir}\n";
echo "الهدف: {$targetDir}\n";
