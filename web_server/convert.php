<?
$in_file = "index.html";


$file = file ($in_file);

define ('MINIFIED_FILE', true);


$html = '';
$code_str = '';


foreach ($file as $nx_str)
    {
    $nx_str = trim ($nx_str);
    if (!empty($nx_str))
        if (MINIFIED_FILE)
            {
            $code_str .= $nx_str . " ";
            $html .= $nx_str . " ";
            }
        else
            {
            $code_str .= '"' . $nx_str . '"' . "\n";
            $html .= $nx_str . "\n";
            }
            
    }
$html = trim($html);


$code  = "\n";
$code .= "//\n";
$code .= "// page template\n";
$code .= "// ==============================================================\n";
$code .= "\n";
$code .= "char page_template[] = ";
if (MINIFIED_FILE) $code .=  "\"";
$code .= $code_str;
if (MINIFIED_FILE) $code .=  "\"";
$code .= ";";


$fh = fopen("index_test.html", "w");
fwrite ($fh, $html);
fclose ($fh);


?>
<title>Convert to ESP code</title>
<a href="index_test.html" target="_blank">Test page</a><br /><br />
<textarea>
<?=$code?>
</textarea>


<style>
textarea 
    {
    width: 100%;
    height: 800px;
    }
</style>
