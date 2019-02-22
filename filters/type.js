



const getReportType =function(type){
	switch(type){
		case 1:
			return 'log'
		case 2:
			return 'network'
		case 3:
			return 'system'
		case 4:
			return 'vue'
		default:
			return 'nokown'
	}
}



module.exports = {
	getReportType
}

