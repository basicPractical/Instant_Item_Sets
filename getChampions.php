<?php
include('php-riot-api.php');

$test = new riotapi('na');

try {
  $r = $test->getChampions();
  print_r(json_encode($r));
} catch(Exception $e) {
  echo "Error: " . $e->getMessage();
};

?>