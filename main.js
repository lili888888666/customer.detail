import { createDetailsWidget } from "@livechat/agent-app-sdk";
import axios from 'axios';
import dayjs from 'dayjs';
import { translations } from './i18n.js';

let currentLang = 'en';
function t(key, params = {}) {
    let text = translations[currentLang][key] || key;
    Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
    });
    return text;
}

function updateTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    updateExclusionOptions();
}

function updateExclusionOptions() {
    const select = document.getElementById('exclusionPeriod');
    select.innerHTML = '';
    [1, 3, 6, 99].forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = t('excludeForMonths', { months: month });
        select.appendChild(option);
    });
}

updateTexts();

const LIVECHAT_URL = import.meta.env.PROD
    ? 'https://9f.playkaya.com/api/kaya/livechat' : '/api/kaya/livechat'

let liveChatAccessToken = null;
let detailsWidget;

createDetailsWidget().then((widget) => {
    detailsWidget = widget;
    widget.on("customer_profile", async (profile) => {
        // const survey = profile.chat?.preChatSurvey || [];
        const customVariables = profile.customVariables;
        // console.log("survey: ", survey)
        console.log("customVariables: ", customVariables)
        // const nameField = survey.find(q => q.question === "Name:");
        // const username = nameField ? nameField.answer : "Unknown";
        // console.log("username: ", username)
        liveChatAccessToken = customVariables.liveChatAccessToken
        if (liveChatAccessToken != null) {
            await loadCustomerData()
        } else {
            alert('Cannot load customer token.');
        }
    });
})

const example_data = {
    "bizCode": 1,
    "msg": null,
    "data": {
        "username": "5510987658001",
        "firstName": "Joe",
        "lastName": "Durrent",
        "selfExclusionEnabled": true,
        "selfExclusionMonth": 6,
        "selfExclusionStartTime": 1739114325,
        "selfExclusionEndTime": 1744129125,
        "documentId": "AB-2233-232-323",
        "userRegTime": "2025-04-23T23:11:27.000+0000",
        "kycStatus": 1,
        "totalDeposit": 2500,
        "lastMonthDepositHistory": [
            {
                "time": "2025-04-23T23:12:23.000+0000",
                "amount": 50,
                "tradeNo": "257998bbbdee4edbbb978f424a34d88b",
                "status": 0
            },
            {
                "time": "2025-04-23T23:26:52.000+0000",
                "amount": 50,
                "tradeNo": "257998bbbdee4edbbb978f424a34d88b",
                "status": 1
            },
            {
                "time": "2025-05-07T19:20:15.000+0000",
                "amount": 100,
                "tradeNo": "257998bbbdee4edbbb978f424a34d88b",
                "status": 2
            },
            {
                "time": "2025-04-23T23:12:23.000+0000",
                "amount": 50,
                "tradeNo": "7e2d49cd-5844-4c2a-9d01-a2486aba0e6b",
                "status": 3
            }
        ],
        "withdrawHistory": [
            // {
            //     "time": "2025-04-23T23:12:23.000+0000",
            //     "amount": 245,
            //     "tradeNo": "XXXX23o2i34",
            //     "status": 1
            // }
        ]
    }
}

// window.addEventListener('DOMContentLoaded', loadCustomerData);

async function loadCustomerData() {
    try {
        const res = await axios.get(`${LIVECHAT_URL}/userinfo`, {
            headers: {
                accessToken: liveChatAccessToken
            }
        });
        const { username, firstName, lastName, selfExclusionEnabled, selfExclusionMonth,
            selfExclusionStartTime, selfExclusionEndTime, documentId, userRegTime, kycStatus,
            totalDeposit, lastMonthDepositHistory, withdrawHistory } = res.data.data;

        console.log(res.data.data)

        // const { username, firstName, lastName, selfExclusionEnabled, selfExclusionMonth,
        //         selfExclusionStartTime, selfExclusionEndTime, documentId, userRegTime, kycStatus,
        //         totalDeposit, lastMonthDepositHistory, withdrawHistory } = example_data.data;

        document.getElementById('username').textContent = username;
        document.getElementById('firstName').textContent = firstName;
        document.getElementById('lastName').textContent = lastName;
        const accStatusEl = document.getElementById('accountStatus');
        const accStatus = selfExclusionEnabled
            ? `${t('selfExclusion')} ${selfExclusionMonth} ${t('months')} (${dayjs(selfExclusionStartTime).format('YYYY-MM-DD HH:mm:ss')} - ${dayjs(selfExclusionEndTime).format('YYYY-MM-DD HH:mm:ss')})`
            : "Active";
        accStatusEl.textContent = accStatus.text;
        accStatusEl.style.color = accStatus.isActive ? 'green' : 'red';
        document.getElementById('cpf').textContent = documentId;
        document.getElementById('registrationTime').textContent = dayjs(userRegTime).format('YYYY-MM-DD HH:mm:ss');
        const kycEl = document.getElementById('kycStatus');
        kycEl.textContent = kycStatus === 0 ? 'Not Verified' : 'Verified';
        kycEl.style.color = kycStatus === 0 ? 'red' : 'green';
        document.getElementById('totalDeposit').textContent = `$${totalDeposit}`;

        updateTable('depositHistoryTable', lastMonthDepositHistory, 'noDeposit', 'red');
        updateTable('withdrawHistoryTable', withdrawHistory, 'noWithdraw', 'green');
    } catch (err) {
        console.error('Failed to load customer data:', err);
    }
}

document.getElementById('getUserInfoButton').addEventListener('click', async () => {
    const userInfoBtn = document.getElementById('getUserInfoButton')
    userInfoBtn.disabled = true;
    if (detailsWidget !== null) {
        liveChatAccessToken = detailsWidget.getCustomerProfile().customVariables.liveChatAccessToken
    }
    try {
        await loadCustomerData();
    } catch (err) {
        console.error('Failed to get User Info:', err);
        alert('Failed to get User Info.');
    } finally {
        userInfoBtn.disabled = false;
    }
});

function updateTable(tableId, items, emptyKey, amountColor) {
    const table = document.getElementById(tableId);
    table.innerHTML = '';
    if (!items || items.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" style="text-align: center; color: gray;">${t(emptyKey)}</td>`;
        table.appendChild(row);
    } else {
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${dayjs(item.time).format("YYYY-MM-DD HH:mm:ss")}</td>
                <td>${item.tradeNo}</td>
                <td>${parseTransactionStatus(item.status)}</td>
                <td style="color: ${amountColor};">$${item.amount}</td>`;
            table.appendChild(row);
        });
    }
}

function parseTransactionStatus(status) {
    switch (status) {
        case 1: return t('paid');
        case 2: return t('pending');
        case 3: return t('cancelled');
        default: return t('unknown');
    }
}

document.getElementById('exclusionSubmitButton').addEventListener('click', async () => {
    const exclusionMonthSelected = document.getElementById('exclusionPeriod').value;
    const exclusionBtn = document.getElementById('exclusionSubmitButton')
    exclusionBtn.disabled = true;
    try {
        await axios.get(`${LIVECHAT_URL}/selfExclusion?exclusionMonth=${exclusionMonthSelected}`, {
            headers: {
                accessToken: liveChatAccessToken
            }
        });
        alert('Exclusion Submitted.');
        await loadCustomerData();
    } catch (err) {
        console.error('Failed to submit exclusion:', err);
        alert('Failed to submit.');
    } finally {
        exclusionBtn.disabled = false;
    }
});

document.getElementById('revokeExclusionButton').addEventListener('click', async () => {
    const revokeBtn = document.getElementById('revokeExclusionButton')
    revokeBtn.disabled = true;
    try {
        await axios.get(`${LIVECHAT_URL}/revokeSelfExclusion`, {
            headers: {
                accessToken: liveChatAccessToken
            }
        });
        alert('Revoke Exclusion Submitted.');
        await loadCustomerData();
    } catch (err) {
        console.error('Failed to submit revoke exclusion:', err);
        alert('Failed to submit.');
    } finally {
        revokeBtn.disabled = false;
    }
});
