import * as vscode from 'vscode';
import * as helpers from './../helpers';
import * as path from 'path';
import * as fs from 'fs';
import * as i18n from './../i18n';
import * as reload from './../messages/reload';
import { IconConfiguration } from "../models/IconConfiguration.interface";

/** Command to toggle the Angular icons. */
export const toggleAngularIcons = () => {
    return checkAngularIconsStatus()
        .then(showQuickPickItems)
        .then(handleQuickPickActions);
};

/** Show QuickPick items to select prefered configuration for the folder icons. */
const showQuickPickItems = isEnabled => {
    const on: vscode.QuickPickItem = {
        description: i18n.translate('toggleSwitch.on'),
        detail: i18n.translate('angular.enableIcons'),
        label: isEnabled ? "\u2714" : "\u25FB"
    };
    const off: vscode.QuickPickItem = {
        description: i18n.translate('toggleSwitch.off'),
        detail: i18n.translate('angular.disableIcons'),
        label: !isEnabled ? "\u2714" : "\u25FB"
    };
    return vscode.window.showQuickPick(
        [on, off], {
            placeHolder: i18n.translate('angular.toggleIcons'),
            ignoreFocusOut: false
        });
};

/** Handle the actions from the QuickPick. */
const handleQuickPickActions = value => {
    if (!value || !value.description) return;
    switch (value.description) {
        case i18n.translate('toggleSwitch.on'): {
            checkAngularIconsStatus().then(result => {
                if (!result) {
                    helpers.setThemeConfig('angular.iconsEnabled', true, true);
                }
            });
            break;
        }
        case i18n.translate('toggleSwitch.off'): {
            checkAngularIconsStatus().then(result => {
                if (result) {
                    helpers.setThemeConfig('angular.iconsEnabled', false, true);
                }
            });
            break;
        }
        default:
            break;
    }
};

/** Enable icons for angular files */
export const enableAngularIcons = () => {
    return addAngularFileExtensions().then(() => {
        reload.showConfirmToReloadMessage().then(result => {
            if (result) helpers.reload();
        });
    });
};

/** Disable icons for angular files */
export const disableAngularIcons = () => {
    return deleteAngularFileExtensions().then(() => {
        reload.showConfirmToReloadMessage().then(result => {
            if (result) helpers.reload();
        });
    });
};

/** Are the angular icons enabled? */
export const checkAngularIconsStatus = (): Promise<boolean> => {
    return helpers.getMaterialIconsJSON().then((config) => {
        if (config.fileExtensions['module.ts']) {
            return true;
        } else {
            return false;
        }
    });
};

/** Add file extensions for angular files */
const addAngularFileExtensions = (): Promise<void> => {
    const iconJSONPath = path.join(helpers.getExtensionPath(), 'out', 'src', 'material-icons.json');
    return helpers.getMaterialIconsJSON().then(config => {
        fs.writeFileSync(iconJSONPath, JSON.stringify(createConfigWithAngular(config), null, 2));
    });
};

const createConfigWithAngular = (config: IconConfiguration) => {
    return {
        ...config,
        "fileExtensions": {
            ...config.fileExtensions,
            "module.ts": "_file_angular",
            "routing.ts": "_file_angular_routing",
            "component.ts": "_file_angular_component",
            "guard.ts": "_file_angular_guard",
            "service.ts": "_file_angular_service",
            "pipe.ts": "_file_angular_pipe",
        }
    };
};

/** Remove file extensions for angular files */
const deleteAngularFileExtensions = (): Promise<void> => {
    const iconJSONPath = path.join(helpers.getExtensionPath(), 'out', 'src', 'material-icons.json');
    return helpers.getMaterialIconsJSON().then(config => {
        fs.writeFileSync(iconJSONPath, JSON.stringify({ ...helpers.removeIconExtensions(config, 'angular') }, null, 2));
    });
};