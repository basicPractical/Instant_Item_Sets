<?php
include('php-riot-api.php');

$summoner_id = $_GET["id"];
$champ_id = $_GET["champId"];

$test = new riotapi('na');

try {
    $r = $test->getMatchHistoryForChamp($summoner_id, $champ_id);
    print_r(json_encode($r));
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
};


?>