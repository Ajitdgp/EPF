
function get_latest_visitor_count(ip, date, key) {

    let  navigatorString = navigator.userAgent;

    let browserName = "";

    if (navigatorString.indexOf("Chrome") > -1) {
        browserName = "Chrome";
    } else if (navigatorString.indexOf("Edg") > -1) {
        browserName = "Internet Explorer / Edge";
    } else if (navigatorString.indexOf("Mozilla") > -1 || navigatorString.indexOf("Firefox") > -1) {
        browserName = "Firefox";
    } else if (navigatorString.indexOf("Safari") > -1) {
        browserName = "Safari";
    } else if (navigatorString.indexOf("OP") > -1) {
        browserName = "Opera";
    }
    //console.log(browserName);


    if (localStorage.getItem("browserName") !== null && localStorage.getItem("ipAddress") !== null && localStorage.getItem("date") !== null) {

        var decrypt_browser = CryptoJS.AES.decrypt(localStorage.getItem("browserName"), key);
        var decrypt_date = CryptoJS.AES.decrypt(localStorage.getItem("date"), key);
        var decrypt_ip = CryptoJS.AES.decrypt(localStorage.getItem("ipAddress"), key);

        let decrypted_browser = decrypt_browser.toString(CryptoJS.enc.Utf8);
        let decrypted_date = decrypt_date.toString(CryptoJS.enc.Utf8);
        let decrypted_ip = decrypt_ip.toString(CryptoJS.enc.Utf8);

        if (decrypted_browser === browserName && decrypted_ip === ip && decrypted_date === date) {
            // only get the visitors count, no need to update the count
            common_visitors_count(browserName, ip, date, key, false, 0);

        } else if (decrypted_browser !== "" && decrypted_ip !== "" && decrypted_date !== "") {
            // update the visitors count and write the data and update the internal data
            common_visitors_count(browserName, ip, date, key, true, 1);

            // First four parameters are inputs and last second is , counter update status , if it true : increment the counter value else not required, as return exact counter value
            // last paramter is return only counter value or write the visitor data 1 - Visitor count and erite the data  0 - only visitor count

        } else if (decrypted_browser === "" || decrypted_ip === "" || decrypted_date === "") {
            common_visitors_count(browserName, ip, date, key, false, 0);
        }
    } else {
        // store the data, increment the count and get visitors count 
        common_visitors_count(browserName, ip, date, key, true, 1);
    }




}

function  common_visitors_count(browserName, ip, date, key, update_count, visitor_status) {
    let sdata = {};

    localStorage.setItem("browserName", CryptoJS.AES.encrypt(browserName, key));
    localStorage.setItem("ipAddress", CryptoJS.AES.encrypt(ip, key));
    localStorage.setItem("date", CryptoJS.AES.encrypt(date, key));

    sdata.Browser = browserName;
    sdata.ip = ip;
    sdata.date = date;
    sdata.update = update_count;

    get_visitors_count(sdata, visitor_status);

}

function get_visitors_count(sdata, type) {
    // type 1 - visitor count and write the data
    // type - 0 only visitors count

    $.ajax({
        url: "/MemberPassBook/passbook/get/visitorcount",
        type: "POST",
        data: sdata,
        success: function (data) {

            //console.log("Response is : "+data);
            document.getElementById("visitor_count").innerHTML = Intl.NumberFormat('en-IN').format(data.count);
                    


            if (type === 1) {
                write_visitors_data(sdata);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {

            console.log("Error: " + errorThrown);
        }
    });


}

function write_visitors_data(sdata) {


    $.ajax({
        url: "/MemberPassBook/passbook/write/visitorcount_history",
        type: "POST",
        data: sdata,
        success: function (data) {
            //console.log("write to file respse : "+data);  
        },
        error: function (jqXHR, textStatus, errorThrown) {

            console.log("Error" + errorThrown);
        }
    });

}


