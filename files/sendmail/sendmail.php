<?php
	use PHPMailer\PHPMailer\PHPMailer;
	use PHPMailer\PHPMailer\Exception;

	require 'phpmailer/src/Exception.php';
	require 'phpmailer/src/PHPMailer.php';
	require 'functions.php';

	$mail = new PHPMailer(true);
	$mail->CharSet = 'UTF-8';
	$mail->setLanguage('ru', 'phpmailer/language/');
	$mail->IsHTML(true);

	/*
	$mail->isSMTP();                                            //Send using SMTP
	$mail->Host       = 'smtp.example.com';                     //Set the SMTP server to send through
	$mail->SMTPAuth   = true;                                   //Enable SMTP authentication
	$mail->Username   = 'user@example.com';                     //SMTP username
	$mail->Password   = 'secret';                              //SMTP password
	$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
	$mail->Port       = 465;   */                
	

	//От кого письмо
	$mail->setFrom('info@trabajosacademicos.es'); // Указать нужный E-mail
	//Кому отправить
	$mail->addAddress('info@tesiuniversitaria.online'); // Указать нужный E-mail

	//Тема письма
	if(!empty($_POST['price'])){
		$mail->Subject = 'Замовлення на суму' . $_POST['price'] . '€';
	}else{
		$mail->Subject = 'Передзвоніть мені';
	}

	if(trim(!empty($_POST['name'])) && trim(!empty($_POST['email'])) && trim(!empty($_POST['full_phone']))){
		$My_name=$_POST["name"];
		$My_phone=$_POST["full_phone"];
		$My_email=$_POST["email"];
		$My_massage = $_POST['comment'];

		$body = "<p><b>Name:</b> " . $My_name . "<br/></p>";
		$body.= '<p><b>Phone:</b> '. $My_phone .'<br/></p>';
		$body.= '<p><b>E-mail:</b> '. $My_email .'</p>';
		$body.= '<p><b>Price:</b> '. $_POST['price'] . '€' .'</p>';
		$body.= '<p><b>Comment:</b> '. $My_massage .'</p>';

		$arr = array('Сайт:' => 'tesiuniversitaria.online',
								'Имя:' => $My_name,
								'Телефон:' => $My_phone,
								'Email:' => $My_email, 
								'Price:' => $_POST['price'] . '€', 
								'Comment:' => $My_massage
							);

		$text='';
					
		foreach($arr as $key => $value) {
			$text .= $key . $value . '%0A';
		};
		
		$BOT_TOKEN = '5848674393:AAGnCAH2_R6L5MAXGxxhKo7BLJEx0Nii9sA';
		$API_URL = 'https://api.telegram.org/bot' . $BOT_TOKEN . '/';
		$CHAT_ID = -817468262;

		$sendTo = $API_URL . 'sendmessage?chat_id=' . $CHAT_ID . '&text=' . $text;
		file_get_contents($sendTo);
	}


	$mail->Body = $body;

	//Отправляем
	if (!$mail->send()) {
		$message = 'Ошибка';
	} else {
		$message = 'Данные отправлены!';
	}

	$response = ['message' => $message];

	header('Content-type: application/json');
	echo json_encode($response);
?>