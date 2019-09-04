

/*=============================================
=            Global Variables            =
=============================================*/

let columns = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];
let rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
let solutionColors = [];
//example output:
//['A1','500','Water']
let partialNewLineForEchoWorklist = [];
let solutionSourceWellsForEchoWorkList = [];

/*=====  End of Global Variables  ======*/


/*=============================================
=            Functions            =
=============================================*/
//Function source: https://stackoverflow.com/questions/1484506/random-color-generator
let getRandomColor = () => {
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    //so the color isn't too dark 
    var o = 0.5;

    return 'rgb(' + r + ',' + b + ',' + g + ',' + o + ')';
}
//this will highlight alls well which were passed a volume above 0
let highlightWells = (data, plateNumber) => {

    var newColor = getRandomColor();
    //store so we can assign colors in the solution source plate
    solutionColors.push(newColor);

    data.forEach(e => {
        if (e['Additive ' + plateNumber + ' amount'] != 0) {
            var wellID = '#' + e['Well Address 384'] + 'P' + plateNumber;

            $(wellID).css('background-color', newColor);
        }
    });
}
//speifically for the solution source plate but same purpose as highlightWells
let highlightSolutionPlate = (solutionsArray, plateNumber) => {
    //for each solution/well pair
    solutionsArray.forEach(e => {
        //generate the well ID 
        var wellID = '#' + e[1] + 'P' + plateNumber;
        // console.log(wellID);
        //highlight the target well
        $(wellID).addClass('clicked');
        //set the color of the well 
        $(wellID).css('background-color', e[2]);
    })
}
//generate columns and rows for each plate 
let columnsAndRows = (container, plateNumber, col, row) => {

    //generate the column labels
    col.forEach(col => {
        //create a new div element 
        var newDiv = $('<div>');
        newDiv.addClass('label');
        //add column identifier 
        newDiv.addClass('_' + col);
        //set column 00 to blank as the space is needed for formatting 
        if (col == '00') {
            newDiv.text('');
        }
        else {
            newDiv.text(col);
        }
        container.append(newDiv);
    });
    //generate the rows
    row.forEach(row => {
        //row header 
        var rowLetter = $('<div>');
        rowLetter.addClass('label a');
        rowLetter.text(row);

        container.append(rowLetter);
        //create 12 wells per 'row' 
        for (let i = 1; i < col.length; i++) {
            var well = $('<button>');
            well.addClass(row + ' well _' + columns[i]);
            well.attr('id', row + i + 'P' + plateNumber);
            well.text(row + i);
            container.append(well);
        }
    });
}
//
let cutArrayTo96 = (is384) => {
    //if not a 384 plate, cut the array down to represent a 96well plate 
    if (is384 === false) {
        var slicedCol = columns.slice(0, 13);
        var slicedRows = rows.slice(0, 8);
        return [slicedCol, slicedRows];
    }
    else {
        return [columns, rows];
    }
}
//funciton that dynamically creates a 96well plate
let generatePlate = (is384, plateNumber) => {
    // generate plate area divs
    var viewport = $('<div id="custom-view">');
    var plateview = $('<div class="plateview">');
    var plate = $('<div class="plate">');
    var container = $('<div class="container item" id="plate-area">');
    /*=============================================
    =            Build new plate area            =
    =============================================*/
    var parentContainer = $('<div class="container">');
    var divFor384 = $('<div class="col">');
    var rowFor96 = $('<div class="row">');
    rowFor96.css('width', '1300px')
    var plate_1_96 = $('<div class="col plate1">');
    var plate_2_96 = $('<div class="col plate2">');
    var divider = $('<div class="w-100">')
    var plate_3_96 = $('<div class="col plate3">');
    var plate_4_96 = $('<div class="col plate4">');

    $('body').append(parentContainer);
    parentContainer.append(divFor384);
    parentContainer.append(rowFor96);
    rowFor96.append(plate_1_96);
    rowFor96.append(plate_2_96);
    rowFor96.append(divider);
    rowFor96.append(plate_3_96);
    rowFor96.append(plate_4_96);
    /*=====  End of Build new plate area  ======*/
    $(divFor384).append(viewport);

    viewport.append(plateview);
    plateview.append(plate);
    plate.append(container);

    const [c, r] = cutArrayTo96(is384);

    columnsAndRows(container, plateNumber, c, r);
}
//function to generate the 4 subsequent plates associated with the 384
//iterate through 1 to 4
let generate96WellPlates = () => {
    //cut the array down to represent a 96well plate
    const [slicedCol, slicedRows] = cutArrayTo96(false);
    //generate plate area divs
    //go through each div with class name plate1 to plate4
    for (let i = 1; i < 5; i++) {

        var viewport = $('<div id="custom-view">');
        var plateview = $('<div class="plateview">');
        var plate = $('<div class="plate">');
        var container = $('<div class="container item" id="plate-area">');

        $(`.plate${i}`).append(viewport);

        columnsAndRows(container, null, slicedCol, slicedRows);

        viewport.append(plateview);
        plateview.append(plate);
        plate.append(container);
    }
}
//called in the callback function after the file is parsed 
//Rounding up the ammount of well to to fill
//Assume the user will fill each well 60uL 
let createSolutionPlate = (is384, solutionsObject, totalNumberOfPlates) => {
    // generatePlate(is384, totalNumberOfPlates + 1);
    generatePlate(is384, totalNumberOfPlates + 1);
    //An array of the amounts of solutions
    var solutionAmounts = Object.values(solutionsObject);
    //An array containging the solution names 
    var solutionNames = Object.keys(solutionsObject);
    //An array that will contain the number of wells to fill per solution
    var numberOfWellsToFillPerSolution = []

    solutionAmounts.forEach(e => {
        //60 is the max amount of liquid per well 
        var amount = Math.ceil(e / 60);
        numberOfWellsToFillPerSolution.push(amount);
    });
    //used to eventually generate the source wells for the final echo worklist csv
    var solutionSourceWells = [];
    // console.log(numberOfWellsToFillPerSolution);
    //store the output of the below loop into an object?
    var solutionWells = [];
    //if count = 25, set it equal to one again, increment the letterIndexNumber
    //number of wells to fill per solution 
    //in this case this should output an array contianing 3 elements since it is outside of this 1st loop
    //iterate through the number of wells to fill per solution
    for (let i = 0; i < numberOfWellsToFillPerSolution.length; i++) {
        //the 1st well in the row 
        var wellNumber = 1;
        //variable to hold the current letter 
        var currentWellLetter = rows.shift();
        //variable to hold the current solution 
        var currentSolution = solutionNames.shift();
        //variable to hold the color associated with the solution 
        var currentColor = solutionColors.shift();

        var tempArrToHoldSolutionSourceWells = [];
        //iterate through each well number until the number of wells to fill has been met 
        for (let j = 0; j < numberOfWellsToFillPerSolution[i]; j++) {
            //store the solution/well
            solutionWells.push([currentSolution, (currentWellLetter + wellNumber), currentColor]);
            tempArrToHoldSolutionSourceWells.push(currentWellLetter + wellNumber);
            // console.log(currentWellLetter + wellNumber);
            //need to move to the next letter when the wellNumber reaches 12/24
            if (wellNumber < columns.length - 1) {
                wellNumber++;
            }
            else {
                currentWellLetter = rows.shift();
                wellNumber = 1;
            }
        }
        solutionSourceWells.push(tempArrToHoldSolutionSourceWells);
    }
    // console.log(solutionSourceWells);
    //format solution source wells for the echo worklist 
    solutionSourceWells.forEach(e => {
        solutionSourceWellsForEchoWorkList.push(sourceSolutionFormatting(e));
    });
    console.log(solutionSourceWellsForEchoWorkList);
    highlightSolutionPlate(solutionWells, totalNumberOfPlates + 1);
}
//write a function that takes in an array 
//example array: ["A1", "A1", "Plate 1", "500", "Water", "250", "RebA", "500", "Mg"]
//example output:
//['A1','500','Water']
//['A1','250','RebA']
//['A1','500','Mg']
//assuming you will only be passes one array at a time 
// let exampleArray = ["A1", "A1", "Plate 1", "500", "Water", "250", "RebA", "500", "Mg"];
let formatArrayIntoLines = (arr) => {
    //current well always 1st in the array 
    let currentWell = arr[0];
    //iterate through the incoming array 
    for (let i = 3; i <= 7; i += 2) {
        //grab the solution/amount pair
        var slicedArr = arr.slice(i, i + 2);
        //eliminate wells given a volume of 0
        if (slicedArr[0] !== '0') {
            //to store the 'example output'
            let tempArray = [];

            tempArray.push(currentWell);
            //seperate the solution/amount pair array
            tempArray.push(slicedArr.pop());
            tempArray.push(slicedArr.pop());
            //push to new line
            partialNewLineForEchoWorklist.push(tempArray);
        }
    }
}

var exampleArray = [["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "B13", "B14", "B15", "B16", "B17", "B18", "B19", "B20", "B21", "B22", "B23", "B24", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "C11", "C12", "C13", "C14", "C15", "C16", "C17", "C18", "C19", "C20", "C21", "C22", "C23", "C24", "D1", "D2", "D3", "D4", "D5"], ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E19", "E20", "E21", "E22", "E23", "E24", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "F13"]];
let sourceSolutionFormatting = (arr) => {
    //if the legnth of the array is 24 or less, return the 1st and last index of that array
    if (arr.length < 25) return `{${arr[0]}:${arr[arr.length - 1]}}`;

    return `{${arr[0]}:${arr[23]}},${sourceSolutionFormatting(arr = arr.slice(24))}`
}
/*=====  End of Functions  ======*/


/*=============================================
=            CSV parsing/recreation            =
=============================================*/
//passed into the parse funciton to print the results
//callback function 
let completeFn = (results) => {

    if (results && results.errors) {
        if (results.errors) {
            errorCount = results.errors.length;
            firstError = results.errors[0];
        }
        if (results.data && results.data.length > 0)
            rowCount = results.data.length;
    }
    //check the dropdown menu selection for the size of the plate to generate 
    var is384 = true;
    var plateType = $('.form-control').val();
    if (plateType == '96') {
        is384 = false;
    }
    //determine how many plates to generate by looking at how many additives there are 
    //since there will always be at least 3 (now 5 //20190826//) items in the array, subtract out the well assignment and divide the result by 2 to give you the number of additives 
    var additives = Object.keys(results.data[0])
    var numberOfPlatesToGenerate = (additives.length - 3) / 2

    //need to make a loop to generate X number of plates
    //pass in plate number to create unquie ids?
    let plateNumber = 1;

    //number of plates 1 to 4 
    while (plateNumber <= numberOfPlatesToGenerate) {
        generatePlate(is384, plateNumber);
        generate96WellPlates();
        highlightWells(results.data, plateNumber);
        plateNumber++;
    }
    //used to hold the solution name (key) and the total amount (value)
    let totalSolution = {};
    //variables used to iterate 
    var solutionAmountCount = 3;
    var solutionNameCount = 1;

    var sizeOfResultsObject = Object.keys(results.data).length;
    //get the total amount of each solution and store the result in an object 
    while (solutionAmountCount < additives.length) {
        var solutionTotal = 0;

        for (var i = 0; i < sizeOfResultsObject - 1; i++) {
            //for each object in data, turn each object into an array
            var wellInfo = Object.values(results.data[i])
            //Generate the partial (missing solution source wells) new CSV lines 
            formatArrayIntoLines(wellInfo);
            //total values
            //for example solution 1 will be at index of 1 (now 3) in each array generated 
            solutionTotal += Number(wellInfo[solutionAmountCount]);
        }
        //after totaling, get the name of the solution and add the name and total as a k/v pair to the totalSolution object 
        solutionName = results.data[0]['Additive ' + solutionNameCount];
        //convert from nL to uL
        totalSolution[solutionName] = solutionTotal / 1000;
        //each amount will be at an odd index number when in the for loop 
        solutionAmountCount += 2;
        solutionNameCount++;
    }
    createSolutionPlate(is384, totalSolution, numberOfPlatesToGenerate);
    console.log(partialNewLineForEchoWorklist);
}

/*=====  End of CSV parsing/recreation  ======*/

$(document).ready(() => {
    //toggle the color of the button when clicked 
    $('.well').click((e) => {
        e.preventDefault();
        $(this).toggleClass('clicked');
    });

    const input = $('#files');
    //once use uploads a csv
    input.change((e) => {
        //imported csv/txt file parser 
        input.parse({
            config: {
                // base config to use for each file
                delimiter: ",",
                //uses the top row as the key value
                header: true,
                complete: completeFn
            },
            before: (file, inputElem) => {
                // executed before parsing each file begins;
                // what you return here controls the flow
                // console.log("Parsing file...", file);
            },
            error: (err, file, inputElem, reason) => {
                // executed if an error occurs while loading the file,
                // or if before callback aborted for some reason
            },
            complete: (results, file) => {
                // executed after all files are complete
                // console.log(results);
                // console.log("Parsing complete:", results, file);
            }
        });
    });

});


