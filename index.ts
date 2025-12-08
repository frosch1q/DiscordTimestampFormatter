enum FormatOption {
    Default = "Default",
    ShortTime = "Short Time",
    LongTime = "Long Time",
    ShortDate = "Short Date",
    LongDate = "Long Date",
    ShortDateTime = "Short Date/Time",
    LongDateTime = "Long Date/Time",
    RelativeTime = "Relative Time",
}

type UiElements = {
    dateInput: HTMLInputElement;
    formatOption: HTMLSelectElement;
    result: HTMLElement;
    preview: HTMLElement;
    copyButton: HTMLButtonElement;
};

let toastTimeout: number | undefined;

function getElement<T extends HTMLElement>(id: string, ctor: new (...args: never[]) => T): T {
    const element = document.getElementById(id);
    if (!element || !(element instanceof ctor)) {
        throw new Error(`Element #${id} not found or has an unexpected type.`);
    }
    return element;
}

function toLocalInputValue(date: Date): string {
    const offsetMs = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offsetMs);
    return localDate.toISOString().slice(0, 16);
}

function setInitialDate(dateInput: HTMLInputElement): void {
    const now = new Date();
    dateInput.value = toLocalInputValue(now);
}

function parseDate(value: string): Date | null {
    if (!value) {
        return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildTimestamp(date: Date, format: FormatOption): string {
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

function formatDateForPreview(date: Date, format: FormatOption): string {
    let options: Intl.DateTimeFormatOptions;

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

function showToast(message: string): void {
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

function updatePreview(ui: UiElements, dateOverride?: Date): void {
    const chosenDate = dateOverride ?? parseDate(ui.dateInput.value);

    if (!chosenDate) {
        ui.preview.textContent = "Pick a date to see the preview.";
        return;
    }

    const format = ui.formatOption.value as FormatOption;
    const formattedDate = formatDateForPreview(chosenDate, format);
    ui.preview.textContent = formattedDate;
}

function generateTimestamp(ui: UiElements): void {
    let selectedDate = parseDate(ui.dateInput.value);
    let usedNow = false;

    if (!selectedDate) {
        selectedDate = new Date();
        ui.dateInput.value = toLocalInputValue(selectedDate);
        usedNow = true;
    }

    const format = ui.formatOption.value as FormatOption;
    const result = buildTimestamp(selectedDate, format);
    ui.result.textContent = result;
    ui.copyButton.disabled = false;
    updatePreview(ui, selectedDate);

    if (usedNow) {
        showToast("No date entered, using the current time.");
    }
}

function copyToClipboard(ui: UiElements): void {
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

    navigator.clipboard.writeText(resultText).then(
        () => showToast("Timestamp copied to clipboard."),
        () => showToast("Could not copy to clipboard.")
    );
}

function init(): void {
    const dateInput = getElement("dateInput", HTMLInputElement);
    const formatOption = getElement("formatOption", HTMLSelectElement);
    const result = getElement("result", HTMLElement);
    const preview = getElement("preview", HTMLElement);
    const copyButton = getElement("copyButton", HTMLButtonElement);
    const generateButton = document.querySelector<HTMLButtonElement>("[data-action='generate']");

    if (!generateButton) {
        throw new Error("Generate button not found.");
    }

    const ui: UiElements = {
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
