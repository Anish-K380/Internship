export const displayConfig = {
    node: {
        normal: {
            fields: ['label', 'id'],
            style: 'normal'
        },

        hover: {
            fields: [],
            style: 'hover'
        },

        click: {
            fields: ['label', 'type', 'id', 'metadata'],
            style: 'selected'
        }
    },

    style: {
	node: {
	    normal: {
		fill: '#ffffff',
		stroke: '#94a3b8',
		strokeWidth: 1.5,
		textColor: '#111827'
	    },

	    hover: {
		fill: '#eff6ff',
		stroke: '#3b82f6',
		strokeWidth: 2.5,
		textColor: '#111827'
	    },

	    selected: {
		fill: '#f5f3ff',
		stroke: '#7c3aed',
		strokeWidth: 3,
		textColor: '#111827'
	    }
	},

	edge: {
	    stroke: '#94a3b8',
	    strokeWidth: 1.75,
	    opacity: 0.45
	},

        panel: {
            hover: {
                width: 400,
                padding: 10,
		fixedScreenSize: true
            },

            click: {
                width: 600,
                padding: 12,
		fixedScreenSize: true
            }
        }
    }
};
