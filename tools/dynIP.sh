#!/bin/bash
 
# Thanks to: https://gist.github.com/kampro/f7fbad000d4f83ecaca3824979217d5a
# settings
# Login information of freenom.com
freenom_email="becsmarthome@gmail.com"
freenom_passwd="BecariosSmart"
# Open DNS management page in your browser.
# URL vs settings:
#   https://my.freenom.com/clientarea.php?managedns={freenom_domain_name}&domainid={freenom_domain_id}
#	https://my.freenom.com/clientarea.php?managedns=becsmarthome.tk&domainid=1024325884
freenom_domain_name="becsmarthome.tk"
freenom_domain_id="1024325884"
 
# main
# get current ip address
current_ip="$(curl -s "https://api.ipify.org/")"
 
if [ "${current_ip}" == "" ]; then
    echo "Could not get current IP address." 1>&2
    exit 1
fi

last_ip=$(<"current-ip.txt")

if [ "${current_ip}" == "${last_ip}" ]
then
    echo "IP address not changed." 1>&2
    exit 0
fi

echo "${current_ip}">"current-ip.txt"

# login
cookie_file=$(mktemp)
loginResult=$(curl --compressed --cacert freenomCert -L -c "${cookie_file}" \
    -F "username=${freenom_email}" -F "password=${freenom_passwd}" \
    "https://my.freenom.com/dologin.php" 2>&1)

if [ "$(echo -e "${loginResult}" | grep "/clientarea.php?incorrect=true")" != "" ]; then
    echo "Login failed." 1>&2
    exit 1
fi

# update
updateResult=$(curl --compressed --cacert freenomCert -L -b "${cookie_file}" \
    -F "dnsaction=modify" -F "records[0][line]=" -F "records[0][type]=A" -F "records[0][name]=" -F "records[0][ttl]=14440" -F "records[0][value]=${current_ip}" \
    "https://my.freenom.com/clientarea.php?managedns=${freenom_domain_name}&domainid=${freenom_domain_id}" 2>&1)

if [ "$(echo -e "$updateResult" | grep "<li class=\"dnssuccess\">")" == "" ]; then
    echo "Update failed." 1>&2
    exit 1
fi

# logout
curl --compressed --cacert freenomCert -b "${cookie_file}" "https://my.freenom.com/logout.php" > /dev/null 2>&1

# clean up
rm -f ${cookie_file}

echo "IP address updated." 1>&2
exit 0
