<?php
/**
 * Plugin Name: Cartline Engineering Intake
 * Description: Receives Vehicle Intelligence technical cases and emails Cartline Engineering.
 * Version: 1.0.0
 */
if (!defined('ABSPATH')) exit;
add_action('rest_api_init', function () {
    register_rest_route('cartline/v1', '/engineering-case', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => 'cartline_engineering_case_submit',
    ]);
});
function cartline_engineering_clean($value, $max = 500) {
    $value = is_scalar($value) ? sanitize_text_field((string) $value) : '';
    return mb_substr($value, 0, $max);
}
function cartline_engineering_case_submit(WP_REST_Request $request) {
    $data = $request->get_json_params();
    if (!is_array($data)) return new WP_Error('invalid_payload','Invalid case data.',['status'=>400]);
    $vehicle = isset($data['vehicle']) && is_array($data['vehicle']) ? $data['vehicle'] : [];
    $contact = cartline_engineering_clean($data['contact'] ?? '', 200);
    $dtc = cartline_engineering_clean($data['dtc'] ?? '', 100);
    $vin = strtoupper(cartline_engineering_clean($vehicle['vin'] ?? '', 17));
    $make = cartline_engineering_clean($vehicle['make'] ?? '', 100);
    $model = cartline_engineering_clean($vehicle['model'] ?? '', 100);
    $year = cartline_engineering_clean($vehicle['year'] ?? '', 10);
    if ($dtc === '' && $contact === '') return new WP_Error('missing_case','Introduce codul de eroare și datele de contact.',['status'=>422]);
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';$key='ct_eng_'.md5($ip);$count=(int)get_transient($key);
    if ($count >= 5) return new WP_Error('rate_limited','Prea multe solicitări. Încearcă mai târziu.',['status'=>429]);
    set_transient($key,$count+1,10*MINUTE_IN_SECONDS);
    $subject='Cartline Engineering · verificare cod eroare'.($dtc?' · '.$dtc:'');
    $lines=['Solicitare nouă din selectorul Cartline THINKCAR','', 'Vehicul: '.trim($make.' '.$model.' '.$year),'VIN: '.($vin?:'—'),'DTC / cod eroare: '.($dtc?:'—'),'Tester actual: '.cartline_engineering_clean($data['currentTool']??'',200),'Problemă descrisă: '.cartline_engineering_clean($data['symptom']??'',1000),'Lucrare: '.cartline_engineering_clean($data['jobId']??'',150),'Contact client: '.($contact?:'—'),'Provider: '.cartline_engineering_clean($data['provider']??'THINKCAR',100),'','Trimis automat de Cartline Vehicle Intelligence.'];
    $sent=wp_mail('business@cartline.ro',$subject,implode("\n",$lines),['Content-Type: text/plain; charset=UTF-8']);
    if(!$sent)return new WP_Error('mail_failed','Mesajul nu a putut fi trimis.',['status'=>500]);
    return new WP_REST_Response(['ok'=>true,'message'=>'Caz trimis către Cartline Engineering.'],200);
}
