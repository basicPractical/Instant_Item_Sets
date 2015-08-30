<?php
include('php-riot-api.php');

$item_id = $_GET["itemId"];
$test = new riotapi('na');

try {
  $r = $test->getItemWithImage($item_id);  
  print_r(json_encode($r));
} catch(Exception $e) {
  echo "Error: " . $e->getMessage();
};


?>