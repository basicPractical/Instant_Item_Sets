<?php
include('php-riot-api.php');

$test = new riotapi('na');

$id = $_GET["id"];

try {
  $r = $test->getChampionById($id);
  print_r(json_encode($r));
} catch(Exception $e) {
  echo "Error: " . $e->getMessage();
};

?>