

// let columns = ['00','01','02','03','04','05','06','07','08','09','10','11','12'];

// //funciton that dynamically creates a 96well plate
// function generatePlate(){
// 	//generate the column labels
// 	columns.forEach(col => {
// 		//create a new div element 
// 		var newDiv = $('<div>');
// 		newDiv.addClass(label);
// 		//add column identifier 
// 		newDiv.addClass('_'+ col);

// 	});
// }

$(document).ready(function () {
	$('.well').click(function (e) {
		e.preventDefault();
		$(this).toggleClass('clicked');
	});
});



