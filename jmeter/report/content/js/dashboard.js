/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 66.15384615384616, "KoPercent": 33.84615384615385};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6346153846153846, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.75, 500, 1500, "GET SELLER PRODUCT"], "isController": false}, {"data": [0.8, 500, 1500, "GET SELLER PRODUCT ID"], "isController": false}, {"data": [0.4, 500, 1500, "PUT BUYER ORDER ID"], "isController": false}, {"data": [0.95, 500, 1500, "GET BUYER PRODUCT ID"], "isController": false}, {"data": [0.4, 500, 1500, "GET BUYER ORDER ID"], "isController": false}, {"data": [0.2, 500, 1500, "POST AUTH REGISTER"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9, 500, 1500, "DELETE SELLER PRODUCT ID"], "isController": false}, {"data": [0.4, 500, 1500, "POST BUYER ORDER"], "isController": false}, {"data": [1.0, 500, 1500, "GET BUYER ORDER"], "isController": false}, {"data": [0.0, 500, 1500, "GET BUYER PRODUCT"], "isController": false}, {"data": [0.65, 500, 1500, "POST AUTH LOGIN"], "isController": false}, {"data": [0.8, 500, 1500, "POST SELLER PRODUCT"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 130, 44, 33.84615384615385, 2262.692307692308, 0, 30154, 310.0, 5894.000000000002, 17426.849999999984, 29490.599999999995, 2.8018449071080647, 2018.7121018484092, 2.877195003017371], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET SELLER PRODUCT", 10, 2, 20.0, 687.2, 296, 2105, 336.0, 2088.8, 2105.0, 2105.0, 1.0126582278481013, 0.7130142405063291, 0.5290743670886076], "isController": false}, {"data": ["GET SELLER PRODUCT ID", 10, 2, 20.0, 602.2, 296, 2137, 317.5, 2048.2000000000003, 2137.0, 2137.0, 1.0135819987837016, 0.7136646690654774, 0.5345061321710927], "isController": false}, {"data": ["PUT BUYER ORDER ID", 10, 6, 60.0, 289.70000000000005, 277, 319, 284.5, 318.2, 319.0, 319.0, 0.42075146211133085, 0.2085678146169058, 0.40505546030209955], "isController": false}, {"data": ["GET BUYER PRODUCT ID", 10, 0, 0.0, 303.0, 263, 557, 278.0, 529.7, 557.0, 557.0, 0.33765532144786603, 0.34210683203336034, 0.17713714715018908], "isController": false}, {"data": ["GET BUYER ORDER ID", 10, 6, 60.0, 286.4, 273, 306, 283.5, 305.2, 306.0, 306.0, 0.42140750105351876, 0.303503937526338, 0.22214430573114202], "isController": false}, {"data": ["POST AUTH REGISTER", 10, 6, 60.0, 2405.9, 1156, 5642, 1444.0, 5565.1, 5642.0, 5642.0, 0.8673779165582445, 0.4963705655304016, 0.4633356644114841], "isController": false}, {"data": ["Debug Sampler", 10, 0, 0.0, 0.6, 0, 3, 0.0, 2.8000000000000007, 3.0, 3.0, 1.2470382840753211, 0.6410556179074698, 0.0], "isController": false}, {"data": ["DELETE SELLER PRODUCT ID", 10, 1, 10.0, 885.4000000000001, 294, 5930, 318.0, 5380.100000000002, 5930.0, 5930.0, 0.6459948320413437, 0.20313509366925064, 0.6148937136627907], "isController": false}, {"data": ["POST BUYER ORDER", 10, 6, 60.0, 856.3000000000001, 277, 5922, 298.0, 5361.500000000002, 5922.0, 5922.0, 0.3406226582192247, 0.16152965120239798, 0.382701531524627], "isController": false}, {"data": ["GET BUYER ORDER", 10, 0, 0.0, 286.8, 277, 312, 283.5, 311.8, 312.0, 312.0, 0.4211767678894832, 0.27750777860843195, 0.2188144926925831], "isController": false}, {"data": ["GET BUYER PRODUCT", 10, 10, 100.0, 20550.8, 9612, 30154, 18767.5, 29940.0, 30154.0, 30154.0, 0.25362686415745156, 2373.7174010221165, 0.13226244673835855], "isController": false}, {"data": ["POST AUTH LOGIN", 10, 3, 30.0, 1143.1, 358, 4107, 445.0, 3959.1000000000004, 4107.0, 4107.0, 1.1802195208308746, 0.580889295408946, 0.37688650714032806], "isController": false}, {"data": ["POST SELLER PRODUCT", 10, 2, 20.0, 1117.6, 298, 6180, 369.5, 5784.9000000000015, 6180.0, 6180.0, 1.0039152695512499, 0.6666624836863768, 6.340156297058528], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 18,204 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 1,222 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 2,137 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["404/Not Found", 6, 13.636363636363637, 4.615384615384615], "isController": false}, {"data": ["The operation lasted too long: It took 1,943 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["400/Bad Request", 12, 27.272727272727273, 9.23076923076923], "isController": false}, {"data": ["The operation lasted too long: It took 25,707 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 16,352 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 2,105 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 9,612 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 16,791 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 5,642 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 30,154 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 2,655 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 5,930 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 28,014 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 2,229 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 1,249 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 19,331 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 6,180 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 4,873 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 16,365 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 24,978 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 4,107 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 1,749 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 1,666 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 2,628 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}, {"data": ["The operation lasted too long: It took 3,335 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, 2.272727272727273, 0.7692307692307693], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 130, 44, "400/Bad Request", 12, "404/Not Found", 6, "The operation lasted too long: It took 18,204 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "The operation lasted too long: It took 1,222 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "The operation lasted too long: It took 2,137 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GET SELLER PRODUCT", 10, 2, "The operation lasted too long: It took 2,105 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "The operation lasted too long: It took 1,943 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["GET SELLER PRODUCT ID", 10, 2, "The operation lasted too long: It took 1,249 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "The operation lasted too long: It took 2,137 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["PUT BUYER ORDER ID", 10, 6, "400/Bad Request", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET BUYER ORDER ID", 10, 6, "400/Bad Request", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST AUTH REGISTER", 10, 6, "The operation lasted too long: It took 4,873 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "The operation lasted too long: It took 1,222 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "The operation lasted too long: It took 1,666 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "The operation lasted too long: It took 5,642 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "The operation lasted too long: It took 3,335 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": ["DELETE SELLER PRODUCT ID", 10, 1, "The operation lasted too long: It took 5,930 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST BUYER ORDER", 10, 6, "404/Not Found", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET BUYER PRODUCT", 10, 10, "The operation lasted too long: It took 18,204 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "The operation lasted too long: It took 25,707 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "The operation lasted too long: It took 16,352 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "The operation lasted too long: It took 9,612 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "The operation lasted too long: It took 16,365 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1], "isController": false}, {"data": ["POST AUTH LOGIN", 10, 3, "The operation lasted too long: It took 4,107 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "The operation lasted too long: It took 1,749 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "The operation lasted too long: It took 2,628 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "", "", "", ""], "isController": false}, {"data": ["POST SELLER PRODUCT", 10, 2, "The operation lasted too long: It took 2,229 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "The operation lasted too long: It took 6,180 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
