"use strict";
var FormatOption;
(function (FormatOption) {
    FormatOption["Default"] = "Default";
    FormatOption["ShortTime"] = "Short Time";
    FormatOption["LongTime"] = "Long Time";
    FormatOption["ShortDate"] = "Short Date";
    FormatOption["LongDate"] = "Long Date";
    FormatOption["ShortDateTime"] = "Short Date/Time";
    FormatOption["LongDateTime"] = "Long Date/Time";
    FormatOption["RelativeTime"] = "Relative Time";
})(FormatOption || (FormatOption = {}));
let toastTimeout;
function getElement(id, ctor) {
    const element = document.getElementById(id);
    if (!element || !(element instanceof ctor)) {
        throw new Error(`Element #${id} not found or has an unexpected type.`);
    }
    return element;
}
function toLocalInputValue(date) {
    const offsetMs = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offsetMs);
    return localDate.toISOString().slice(0, 16);
}
function setInitialDate(dateInput) {
    const now = new Date();
    dateInput.value = toLocalInputValue(now);
}
function parseDate(value) {
    if (!value) {
        return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}
function buildTimestamp(date, format) {
    const timestamp = Math.floor(date.getTime() / 1000);
    switch (format) {
        case FormatOption.Default:
            return `<t:${timestamp}>`;
        case FormatOption.ShortTime:
            return `<t:${timestamp}:t>`;
        case FormatOption.LongTime:
            return `<t:${timestamp}:T>`;
        case FormatOption.ShortDate:
            return `<t:${timestamp}:d>`;
        case FormatOption.LongDate:
            return `<t:${timestamp}:D>`;
        case FormatOption.ShortDateTime:
            return `<t:${timestamp}:f>`;
        case FormatOption.LongDateTime:
            return `<t:${timestamp}:F>`;
        case FormatOption.RelativeTime:
            return `<t:${timestamp}:R>`;
        default:
            throw new Error("Invalid format option.");
    }
}
function formatDateForPreview(date, format) {
    let options;
    switch (format) {
        case FormatOption.Default:
            options = { dateStyle: "medium", timeStyle: "short" };
            break;
        case FormatOption.ShortTime:
            options = { hour: "2-digit", minute: "2-digit" };
            break;
        case FormatOption.LongTime:
            options = { hour: "2-digit", minute: "2-digit", second: "2-digit" };
            break;
        case FormatOption.ShortDate:
            options = { year: "numeric", month: "numeric", day: "numeric" };
            break;
        case FormatOption.LongDate:
            options = { year: "numeric", month: "long", day: "numeric" };
            break;
        case FormatOption.ShortDateTime:
            options = { dateStyle: "short", timeStyle: "short" };
            break;
        case FormatOption.LongDateTime:
            options = { dateStyle: "full", timeStyle: "long" };
            break;
        case FormatOption.RelativeTime: {
            const now = new Date();
            const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
            const formatter = new Intl.RelativeTimeFormat("de", { numeric: "auto" });
            if (Math.abs(diffInSeconds) < 60) {
                return formatter.format(diffInSeconds, "seconds");
            }
            if (Math.abs(diffInSeconds) < 3600) {
                return formatter.format(Math.floor(diffInSeconds / 60), "minutes");
            }
            if (Math.abs(diffInSeconds) < 86400) {
                return formatter.format(Math.floor(diffInSeconds / 3600), "hours");
            }
            return formatter.format(Math.floor(diffInSeconds / 86400), "days");
        }
        default:
            throw new Error("Invalid format option.");
    }
    return new Intl.DateTimeFormat("de-DE", options).format(date);
}
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) {
        throw new Error("Toast element not found.");
    }
    toast.textContent = message;
    toast.classList.add("show");
    if (toastTimeout) {
        window.clearTimeout(toastTimeout);
    }
    toastTimeout = window.setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}
function updatePreview(ui, dateOverride) {
    const chosenDate = dateOverride ?? parseDate(ui.dateInput.value);
    if (!chosenDate) {
        ui.preview.textContent = "Pick a date to see the preview.";
        return;
    }
    const format = ui.formatOption.value;
    const formattedDate = formatDateForPreview(chosenDate, format);
    ui.preview.textContent = formattedDate;
}
function generateTimestamp(ui) {
    let selectedDate = parseDate(ui.dateInput.value);
    let usedNow = false;
    if (!selectedDate) {
        selectedDate = new Date();
        ui.dateInput.value = toLocalInputValue(selectedDate);
        usedNow = true;
    }
    const format = ui.formatOption.value;
    const result = buildTimestamp(selectedDate, format);
    ui.result.textContent = result;
    ui.copyButton.disabled = false;
    updatePreview(ui, selectedDate);
    if (usedNow) {
        showToast("No date entered, using the current time.");
    }
}
function copyToClipboard(ui) {
    const resultText = ui.result.textContent?.trim();
    if (!resultText) {
        showToast("Nothing to copy yet.");
        return;
    }
    if (!navigator.clipboard) {
        const tempInput = document.createElement("input");
        tempInput.value = resultText;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        tempInput.remove();
        showToast("Timestamp copied to clipboard.");
        return;
    }
    navigator.clipboard.writeText(resultText).then(() => showToast("Timestamp copied to clipboard."), () => showToast("Could not copy to clipboard."));
}
function init() {
    const dateInput = getElement("dateInput", HTMLInputElement);
    const formatOption = getElement("formatOption", HTMLSelectElement);
    const result = getElement("result", HTMLElement);
    const preview = getElement("preview", HTMLElement);
    const copyButton = getElement("copyButton", HTMLButtonElement);
    const generateButton = document.querySelector("[data-action='generate']");
    if (!generateButton) {
        throw new Error("Generate button not found.");
    }
    const ui = {
        dateInput,
        formatOption,
        result,
        preview,
        copyButton,
    };
    setInitialDate(dateInput);
    updatePreview(ui, parseDate(dateInput.value) ?? undefined);
    dateInput.addEventListener("input", () => updatePreview(ui));
    dateInput.addEventListener("change", () => updatePreview(ui));
    formatOption.addEventListener("change", () => updatePreview(ui));
    generateButton.addEventListener("click", () => generateTimestamp(ui));
    copyButton.addEventListener("click", () => copyToClipboard(ui));
}
document.addEventListener("DOMContentLoaded", init);
