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

function formatTimestamp(dateString: string, format: FormatOption): string {
    let date = new Date(dateString);
    let timestamp = Math.floor(date.getTime() / 1000);

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

function generateTimestamp(): void {
    let dateInputElement = document.getElementById("dateInput") as HTMLInputElement;
    let formatOptionElement = document.getElementById("formatOption") as HTMLSelectElement;
    let resultElement = document.getElementById("result");
    let copyButton = document.getElementById("copyButton");

    if (dateInputElement && formatOptionElement && resultElement && copyButton) {
        let dateInput = dateInputElement.value;
        if (!dateInput) {
            showToast("Please enter a date.");
            dateInput = new Date().toISOString();
        }
        let formatOption = formatOptionElement.value as FormatOption;
        let result = formatTimestamp(dateInput, formatOption);
        resultElement.innerText = result;
        copyButton.style.display = "inline";
    } else {
        throw new Error("A required element was not found.");
    }
    showPreview();
}

function copyToClipboard(): void {
    let resultElement = document.getElementById("result");

    if (resultElement) {
        let resultText = resultElement.innerText;
        navigator.clipboard.writeText(resultText).then(() => {
            showToast("Timestamp was copied to the clipboard!");
        });
    } else {
        throw new Error("Result element not found.");
    }
}

function showToast(message: string): void {
    let toast = document.getElementById("toast");

    if (toast) {
        toast.innerText = message;
        toast.className = "show";
        setTimeout(() => {
            toast.className = toast.className.replace("show", "");
        }, 3000);
    } else {
        throw new Error("Toast element not found.");
    }
}

function formatDateForPreview(dateString: string, format: FormatOption): string {
    let date = new Date(dateString);
    let options: Intl.DateTimeFormatOptions;

    switch (format) {
        case FormatOption.Default:
            options = { dateStyle: 'medium', timeStyle: 'short' };
            break;
        case FormatOption.ShortTime:
            options = { hour: '2-digit', minute: '2-digit' };
            break;
        case FormatOption.LongTime:
            options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
            break;
        case FormatOption.ShortDate:
            options = { year: 'numeric', month: 'numeric', day: 'numeric' };
            break;
        case FormatOption.LongDate:
            options = { year: 'numeric', month: 'long', day: 'numeric' };
            break;
        case FormatOption.ShortDateTime:
            options = { dateStyle: 'short', timeStyle: 'short' };
            break;
        case FormatOption.LongDateTime:
            options = { dateStyle: 'full', timeStyle: 'long' };
            break;
        case FormatOption.RelativeTime:
            let now = new Date();
            let diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
            let formatter = new Intl.RelativeTimeFormat('de', { numeric: 'auto' });
            let relativeTime;

            if (Math.abs(diffInSeconds) < 60) {
                relativeTime = formatter.format(diffInSeconds, 'seconds');
            } else if (Math.abs(diffInSeconds) < 3600) {
                relativeTime = formatter.format(Math.floor(diffInSeconds / 60), 'minutes');
            } else if (Math.abs(diffInSeconds) < 86400) {
                relativeTime = formatter.format(Math.floor(diffInSeconds / 3600), 'hours');
            } else {
                relativeTime = formatter.format(Math.floor(diffInSeconds / 86400), 'days');
            }
            return relativeTime;
        default:
            throw new Error("Ungültige Formatoption.");
    }

    return new Intl.DateTimeFormat('de-DE', options).format(date);
}

function showPreview(): void {
    let dateInputElement = document.getElementById("dateInput") as HTMLInputElement;
    let formatOptionElement = document.getElementById("formatOption") as HTMLSelectElement;
    let previewElement = document.getElementById("preview");

    if (dateInputElement && formatOptionElement && previewElement) {
        let dateInput = dateInputElement.value;
        if (!dateInput) {
            dateInput = new Date().toISOString();
        }
        let formatOption = formatOptionElement.value as FormatOption;
        let formattedDate = formatDateForPreview(dateInput, formatOption);
        previewElement.innerText = formattedDate;
    } else {
        showToast("Ein erforderliches Element wurde nicht gefunden.");
    }
}

function showOptions() {
    let element = document.getElementById("options");
    if (element) {
        element.classList.remove("slide-out-left");
        element.classList.add("show-options");
        element.classList.add("slide-in-left");
        element.classList.remove("d-none");
    }
}

function hideOptions() {
    let element = document.getElementById("options");
    if (element) {
        element.classList.remove("slide-in-left");
        element.classList.add("slide-out-left")
        setTimeout(() => {
            element.classList.add("d-none");
            element.classList.remove("show-options");
            element.classList.remove("slide-out-left");
        }, 500);
    }
}