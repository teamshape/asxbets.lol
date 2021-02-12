<?php

require_once "php-discord-sdk/support/sdk_discord.php";
require_once "/var/www/html/teambot-web.php";

global $number;
$number = 0;

$discord = new DiscordSDK();
$discord->SetAccessInfo("Bot", $bottoken);

header('Content-Type: application/json');
$dbh  = new PDO($dsn, $user, $pass) or die("cannot open the database");

$query = "select count(createdAt) users, substr(DATE_ADD(createdAt, INTERVAL 11 HOUR), 1, 10) date from users group by substr(DATE_ADD(createdAt, INTERVAL 11 HOUR), 1, 10)";
$total = 0;
$runningTotalArray = [];
foreach ($dbh->query($query) as $row)
{
	$total += $row['users'];
	$runningTotalArray[$row['date']] = $total;
}

$query = "select count(createdAt) chatlines, substr(date_add(createdAt, INTERVAL 11 HOUR), 1, 10) as date from chats group by substr(date_add(createdAt, INTERVAL 11 HOUR), 1, 10)";
$chatArray = [];
foreach ($dbh->query($query) as $row)
{
	$chatArray[$row['date']] = $row['chatlines'];
}

$query = "select count(createdAt) chatlines, substr(date_add(createdAt, INTERVAL 11 HOUR), 12, 2) as hour from chats group by substr(date_add(createdAt, INTERVAL 11 HOUR), 12, 2);";
$activityArray = [];
foreach ($dbh->query($query) as $row)
{
	$hour = (int) $row['hour'];
	$activityArray[$hour] = $row['chatlines'];
}

/**
$query = "select user as user, count(user) count from chats group by user order by count desc limit 10;";
$losersArray = [];
foreach ($dbh->query($query) as $row)
{
	$losersArray[$row['user']] = $row['count'];
}
 */

$query = "select channel, count(channel) count from chats group by channel;";
$channelsArray = [];
foreach ($dbh->query($query) as $row)
{
	$channelsArray[$row['channel']] = $row['count'];
}

$holdingsArray = [];
$priceArray = [];
$query = "SELECT `users`.`id`, `users`.`guild`, `users`.`user`, `users`.`name`, `users`.`dollars`, `holdings`.`id` AS `holdings.id`, `holdings`.`guild` AS `holdings.guild`, `holdings`.`userId` AS `userId`, `holdings`.`ticker` AS `ticker`, `holdings`.`amount` AS `amount` FROM `users` AS `users` LEFT OUTER JOIN `holdings` AS `holdings` ON `users`.`user` = `holdings`.`userId` WHERE `users`.`dollars` != 50000;";

$discordusers = [];
foreach ($dbh->query($query) as $row)
{
	$ticker = $row['ticker'];
	if (!isset($discordusers[$row['userId']])) {
		$row['discord_username'] = getDiscordUsername($discord, $bottoken, $row['userId']);
	        $discordusers[$row['userId']] = $row['discord_username'];
	}
	else {
		$row['discord_username'] = $discordusers[$row['userId']];
	}
        $holdingsArray[$row['holdings.id']] = $row;
	if (!isset($priceArray[$ticker]) && $row['amount'] != 0) {
		$json = 'https://www.asx.com.au/asx/1/share/' . $ticker;
		$jsonfile = file_get_contents($json);
		$decode = json_decode($jsonfile);
		$priceArray[$ticker] = $decode->last_price;
	}
}


$return = [];
$return['usercount'] = $runningTotalArray;
$return['chatcount'] = $chatArray;
$return['activity'] = $activityArray;
//$return['losers'] = $losersArray;
$return['channels'] = $channelsArray;
$return['holdings'] = $holdingsArray;
$return['stockprice'] = $priceArray;

echo json_encode($return);

$dbh = null;

function getDiscordUsername($discord, $bottoken, $userId) {
	global $number;
	if ($number >= 10) {
		sleep(1);
		$number = 0;
	}
	$number++;
	$result = $discord->RunAPI("GET", "users/" . $userId);
	        if (!$result["success"])
        {
                var_dump($result);
                exit();
        }
	sleep(1);

        return $result['data']['username'];
}
