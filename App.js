Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    // items:{ html:'<a href="https://help.rallydev.com/apps/2.0rc2/doc/">App SDK 2.0rc2 Docs</a>'},

    launch: function() {
        console.log("Justin's first Rally app!");
        
        this.pulldownContainer = Ext.create('Ext.container.Container', {
        	id: 'pulldown-container-id',
        	layout: {
        		type: 'hbox',
        		align: 'stretch'
        	},
        });
        
        this.add(this.pulldownContainer);

		this._loadIterations();
    },
    
    _loadIterations: function() {
    	this.iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
    		fieldLabel: 'Iteration',
    		labelAlign: 'right',
    		width: 300,
    		listeners: {
    			ready: function(comboBox) {
    				this._loadPriorities();
    			},
    			select: function(comboBox, records) {
    				this._loadData();
    			},
    			scope: this
    		},
    	});
    	
    	this.pulldownContainer.add(this.iterComboBox);
    },
    
    _loadPriorities: function() {
    	this.priComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
    		model: 'User Story',
    		field: 'Priority',
    		fieldLabel: 'Priority',
    		labelAlign: 'right',
    		listeners: {
    			ready: function(comboBox) {
    				this._loadData();
    			},
    			select: function(comboBox, records) {
    				this._loadData();
    			},
    			scope: this
    		},
    	});
    	
    	this.pulldownContainer.add(this.priComboBox);
    },
    
    _loadData: function() {
    	var selectedIterRef = this.iterComboBox.getRecord().get('_ref');
    	var selectedPriValue = this.priComboBox.getRecord().get('value');
    	
    	var myFilters = [
				{
					property: 'Iteration',
					operation: '=',
					value: selectedIterRef
				},
				{
					property: 'Priority',
					operation: '=',
					value: selectedPriValue
				}
			];
    	
    	// If store exists, just reload new data
    	if (this.userStoryStore) {
    		this.userStoryStore.setFilter(myFilters);
    		this.userStoryStore.load();
    	} else {
			this.userStoryStore = Ext.create('Rally.data.wsapi.Store', {
				model: 'User Story',
				autoLoad: true,
				filter: myFilters,
				listeners: {
					load: function(myStore, myData, success) {
						console.log('Got data!', myStore, myData, success);	
						if (!this.myGrid) {
							this._createGrid(myStore);
						}
					},
				scope: this
				},
				fetch: ['FormattedID', 'Name', 'Priority', 'ScheduleState']
			});
		}
    },
    
	_createGrid: function(myStoryStore) {
		this.myGrid = Ext.create('Rally.ui.grid.Grid', {
			store: myStoryStore,
			columnCfgs: [
				'FormattedID', 'Name', 'Priority', 'ScheduleState'
			]
		});

		this.add(this.myGrid);
    }
});
