virtualpage.grid.Event = function(config) {
    config = config || {};

    this.exp = new Ext.grid.RowExpander({
        expandOnDblClick: false,
        tpl: new Ext.Template('<p class="desc">{description}</p>'),
        renderer: function(v, p, record) {
            return record.data.description != '' && record.data.description != null ? '<div class="x-grid3-row-expander">&#160;</div>' : '&#160;';
        }
    });
    this.dd = function(grid) {
        this.dropTarget = new Ext.dd.DropTarget(grid.container, {
            ddGroup: 'dd',
            copy: false,
            notifyDrop: function(dd, e, data) {
                var store = grid.store.data.items;
                var target = store[dd.getDragData(e).rowIndex].id;
                var source = store[data.rowIndex].id;
                if (target != source) {
                    dd.el.mask(_('loading'), 'x-mask-loading');
                    MODx.Ajax.request({
                        url: virtualpage.config.connector_url,
                        params: {
                            action: config.action || 'mgr/settings/event/sort',
                            source: source,
                            target: target
                        },
                        listeners: {
                            success: {
                                fn: function(r) {
                                    dd.el.unmask();
                                    grid.refresh();
                                },
                                scope: grid
                            },
                            failure: {
                                fn: function(r) {
                                    dd.el.unmask();
                                },
                                scope: grid
                            }
                        }
                    });
                }
            }
        });
    };
    Ext.applyIf(config, {
        id: 'virtualpage-grid-event',
        url: virtualpage.config.connector_url,
        baseParams: {
            action: 'mgr/settings/event/getlist'
        },
        fields: ['id', 'name', 'description', 'active'],
        autoHeight: true,
        paging: true,
        remoteSort: true,
        save_action: 'mgr/settings/event/updatefromgrid',
        autosave: true,
        plugins: this.exp,
        columns: [this.exp, {
            header: _('vp_id'),
            dataIndex: 'id',
            width: 50,
            sortable: true
        }, {
            header: _('vp_name'),
            dataIndex: 'name',
            width: 150,
            editor: {
                xtype: 'virtualpage-combo-plugin-event',
                allowBlank: false
            },
            sortable: true
        }, {
            header: _('vp_active'),
            dataIndex: 'active',
            sortable: true,
            width: 50,
            editor: {
                xtype: 'combo-boolean',
                renderer: 'boolean'
            }
        }],
        tbar: [{
            text: _('vp_btn_create'),
            handler: this.createEvent,
            scope: this
        }],
        ddGroup: 'dd',
        enableDragDrop: true,
        listeners: {
            render: {
                fn: this.dd,
                scope: this
            }
        }
    });
    virtualpage.grid.Event.superclass.constructor.call(this, config);
};
Ext.extend(virtualpage.grid.Event, MODx.grid.Grid, {
    windows: {}

    ,
    getMenu: function() {
        var m = [];
        m.push({
            text: _('vp_menu_update'),
            handler: this.updateEvent
        });
        m.push('-');
        m.push({
            text: _('vp_menu_remove'),
            handler: this.removeEvent
        });
        this.addContextMenuItem(m);
    }

    ,
    createEvent: function(btn, e) {
        if (!this.windows.createEvent) {
            this.windows.createEvent = MODx.load({
                xtype: 'virtualpage-window-event-create',
                fields: this.getEventFields('create'),
                listeners: {
                    success: {
                        fn: function() {
                            this.refresh();
                        },
                        scope: this
                    }
                }
            });
        }
        this.windows.createEvent.fp.getForm().reset();
        this.windows.createEvent.fp.getForm().setValues({
            active: 1
        });
        this.windows.createEvent.show(e.target);
    }

    ,
    updateEvent: function(btn, e) {
        if (!this.menu.record || !this.menu.record.id) return false;
        var r = this.menu.record;

        if (!this.windows.updateEvent) {
            this.windows.updateEvent = MODx.load({
                xtype: 'virtualpage-window-event-update',
                record: r,
                fields: this.getEventFields('update'),
                listeners: {
                    success: {
                        fn: function() {
                            this.refresh();
                        },
                        scope: this
                    }
                }
            });
        }
        this.windows.updateEvent.fp.getForm().reset();
        this.windows.updateEvent.fp.getForm().setValues(r);
        this.windows.updateEvent.show(e.target);
    }

    ,
    removeEvent: function(btn, e) {
        if (!this.menu.record) return false;

        MODx.msg.confirm({
            title: _('vp_menu_remove') + ' "' + this.menu.record.name + '"',
            text: _('vp_menu_remove_confirm'),
            url: this.config.url,
            params: {
                action: 'mgr/settings/event/remove',
                id: this.menu.record.id
            },
            listeners: {
                success: {
                    fn: function(r) {
                        this.refresh();
                    },
                    scope: this
                }
            }
        });
    }

    ,
    getEventFields: function(type) {
        var fields = [];

        fields.push({
            xtype: 'hidden',
            name: 'id',
            id: 'virtualpage-event-id-' + type
        }, {
            xtype: 'virtualpage-combo-plugin-event',
            fieldLabel: _('vp_name'),
            name: 'name',
            allowBlank: false,
            anchor: '99%',
            id: 'virtualpage-event-name-' + type
        }, {
            xtype: 'textarea',
            fieldLabel: _('vp_description'),
            name: 'description',
            anchor: '99%',
            id: 'virtualpage-event-description-' + type
        });

        fields.push({
            xtype: 'xcheckbox',
            fieldLabel: '',
            boxLabel: _('vp_active'),
            name: 'active',
            id: 'virtualpage-event-active-' + type
        });

        return fields;
    }

});
Ext.reg('virtualpage-grid-event', virtualpage.grid.Event);


virtualpage.window.CreateEvent = function(config) {
    config = config || {};
    this.ident = config.ident || 'mecitem' + Ext.id();
    Ext.applyIf(config, {
        title: _('vp_menu_create'),
        id: this.ident,
        width: 600,
        autoHeight: true,
        labelAlign: 'left',
        labelWidth: 180,
        url: virtualpage.config.connector_url,
        action: 'mgr/settings/event/create',
        fields: config.fields,
        keys: [{
            key: Ext.EventObject.ENTER,
            shift: true,
            fn: function() {
                this.submit()
            },
            scope: this
        }]
    });
    virtualpage.window.CreateEvent.superclass.constructor.call(this, config);
};
Ext.extend(virtualpage.window.CreateEvent, MODx.Window);
Ext.reg('virtualpage-window-event-create', virtualpage.window.CreateEvent);


virtualpage.window.UpdateEvent = function(config) {
    config = config || {};
    this.ident = config.ident || 'meuitem' + Ext.id();
    Ext.applyIf(config, {
        title: _('vp_menu_update'),
        id: this.ident,
        width: 600,
        autoHeight: true,
        labelAlign: 'left',
        labelWidth: 180,
        url: virtualpage.config.connector_url,
        action: 'mgr/settings/event/update',
        fields: config.fields,
        keys: [{
            key: Ext.EventObject.ENTER,
            shift: true,
            fn: function() {
                this.submit()
            },
            scope: this
        }]
    });
    virtualpage.window.UpdateEvent.superclass.constructor.call(this, config);
};
Ext.extend(virtualpage.window.UpdateEvent, MODx.Window);
Ext.reg('virtualpage-window-event-update', virtualpage.window.UpdateEvent);
