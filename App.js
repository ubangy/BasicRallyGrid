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
    			ready: me._loadData,
    			select: me._loadData,
    			scope: me
    		},
    	});
    	
    	this.down('#pulldown-container').add(iterComboBox);
    },
    
    _getFilters: function(iterValue) {
    
        var currentProject =  Rally.environment.getContext().getProject();
        
    	var iterFilter = Ext.create('Rally.data.wsapi.Filter', {
    	    property: 'Iteration',
			operation: '=',
			value: iterValue
    	});
    	
    	var projectfilter = Ext.create('Rally.data.lookback.QueryFilter', {
            property: 'Project',
            operation: '=',
            value: currentProject.ObjectID
        });
    	
    	return projectfilter.and(iterFilter);
    },
    
    _loadData: function() {
    	var selectedIterRef = this.down('#iteration-combobox').getRecord().get('_ref');
    	
    	var myFilters = this._getFilters(selectedIterRef);
    	
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
				fetch: ['FormattedID', 'Name', 'PlanEstimate']
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
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate'),
                    summaryRenderer: function(){
                        return Ext.String.format('TOTAL:');
                    }
                },
                {
                    text: 'Name', dataIndex: 'Name'
                },
                {
                    text: 'Estimate', dataIndex: 'PlanEstimate',
                    summaryType: 'count'
                }
			],
			features: [
                {
                    ftype: 'summary',
                }
            ]
		});

		this.add(this.myGrid);
    },
	
});
