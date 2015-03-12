<?php

/**
 * Enable an Item
 */
class virtualpageItemEnableProcessor extends modObjectProcessor {
	public $objectType = 'virtualpageItem';
	public $classKey = 'virtualpageItem';
	public $languageTopics = array('virtualpage');
	//public $permission = 'save';


	/**
	 * @return array|string
	 */
	public function process() {
		if (!$this->checkPermissions()) {
			return $this->failure($this->modx->lexicon('access_denied'));
		}

		$ids = $this->modx->fromJSON($this->getProperty('ids'));
		if (empty($ids)) {
			return $this->failure($this->modx->lexicon('virtualpage_item_err_ns'));
		}

		foreach ($ids as $id) {
			/** @var virtualpageItem $object */
			if (!$object = $this->modx->getObject($this->classKey, $id)) {
				return $this->failure($this->modx->lexicon('virtualpage_item_err_nf'));
			}

			$object->set('active', true);
			$object->save();
		}

		return $this->success();
	}

}

return 'virtualpageItemEnableProcessor';
