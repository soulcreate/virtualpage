<?php

$virtualpage = $modx->getService('virtualpage', 'virtualpage', $modx->getOption('virtualpage_core_path', null, $modx->getOption('core_path') . 'components/virtualpage/') . 'model/virtualpage/', $scriptProperties);
if(!($virtualpage instanceof virtualpage)) {return '';}
if(!$virtualpage->active) {return '';}
if(isset($_REQUEST['vp_die'])) {return '';}
//
$eventName = $modx->event->name;
//$listEvent = $virtualpage->getEvents();
//
