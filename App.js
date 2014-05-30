Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    items: [
    	{
			xtype: 'container',
			itemId: 'pulldown-container',
			layout: {
				type: 'hbox',
				align: 'stretch'
			}
		}
    ],

    launch: function() {
        console.log("Justin's first Rally app!");
        
        var currentProject =  Rally.environment.getContext().getProject();
        var workspace = Rally.environment.getContext().getWorkspace();
 		console.log(currentProject, workspace);
        
		this._loadIterations();
    },
    
    _loadIterations: function() {
    	var me = this;
    	var iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
    		itemId: 'iteration-combobox',
    		fieldLabel: 'Iteration',
    		labelAlign: 'right',
    		width: 300,
    		listeners: {
    			ready: me._loadPriorities,
    			select: me._loadData,
    			scope: me
    		},
    	});
    	
    	this.down('#pulldown-container').add(iterComboBox);
    },

    _loadPriorities: function() {
    	var priComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
    		itemId: 'priority-combobox',
    		model: 'User Story',
    		field: 'Priority',
    		fieldLabel: 'Priority',
    		labelAlign: 'right',
    		listeners: {
    			ready: this._loadData,
    			select: this._loadData,
    			scope: this
    		},
    	});
    	
    	this.down('#pulldown-container').add(priComboBox);
    },
    
    _getFilters: function(iterValue, priValue) {
    	var iterFilter = Ext.create('Rally.data.wsapi.Filter', {
    	    property: 'Iteration',
			operation: '=',
			value: iterValue
    	});
    	
    	var priFilter = Ext.create('Rally.data.wsapi.Filter', {
    	    property: 'Priority',
			operation: '=',
			value: priValue
    	});
    	
    	return iterFilter.and(priFilter);
    },
    
    _loadData: function() {
    	var selectedIterRef = this.down('#iteration-combobox').getRecord().get('_ref');
    	var selectedPriValue = this.down('#priority-combobox').getRecord().get('value');
    	
    	var myFilters = this._getFilters(selectedIterRef, selectedPriValue);
    	
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
						
						Ext.Array.each(myData, function(data) {
							data.set('Justin', 1);
						});
						
						console.log('After Justin data!', myData);
						
						if (!this.myGrid) {
							this._createGrid(myStore);
						}
						
						this._loadSnapshot(myData, myFilters);
					},
					scope: this
				},
				fetch: ['FormattedID', 'Name', 'Priority', 'ScheduleState', 'CreationDate', 'Justin']
			});
		}
    },
    
	_createGrid: function(myStoryStore) {
	
		console.log('in create!', myStoryStore);
		
		this.myGrid = Ext.create('Rally.ui.grid.Grid', {
			store: myStoryStore,
			columnCfgs: [
				{
                    text: 'Formatted ID', dataIndex: 'FormattedID', xtype: 'templatecolumn',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {
                    text: 'Name', dataIndex: 'Name'
                },
                {
                    text: 'Priority', dataIndex: 'Priority'
                },
                {
                    text: 'Justin', dataIndex: 'Justin', xtype: 'templatecolumn'
                }
			],
		});

		this.add(this.myGrid);
    },
    
    _loadSnapshot: function(myData1, myFilters1) {
    	console.log('Before', myData1, myFilters1);
    	var snapshotStore = Ext.create('Rally.data.lookback.SnapshotStore', {
			context: {
				workspace: '/workspace/41529001',
				project: '/project/19196251073',
				projectScopeUp: false,
				projectScopeDown: false
			},
			filters: [
				{
					property: 'FormattedID',
					operation: '=',
					value: 'S67202'
				}
			],
    		autoLoad: true,
    		listeners: {
        		load: function(store, records) {
            		console.log('Snapshots: ', records[0].get('Blocked'));
        		},
        		scope: this
    		},
    		fetch: ['FormattedID', 'Name', 'ScheduleState', 'Revisions', 'Blocked', 'CreationDate'],
		});
	},
	
});
