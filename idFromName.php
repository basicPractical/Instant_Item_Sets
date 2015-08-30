<?php
include('php-riot-api.php');

$summoner_name = $_GET["name"];
$test = new riotapi('na');

try {  
  $r = $test->getSummonerId($summoner_name);  
  print_r($r);
} catch(Exception $e) {
  echo "Error: " . $e->getMessage();
};

?>