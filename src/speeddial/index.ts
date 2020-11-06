import {
    Animation,
    AnimationDefinition,
    CSSType,
    Color,
    EventData,
    FlexboxLayout,
    GestureTypes,
    GridLayout,
    HorizontalAlignment,
    ImageSource,
    View,
    backgroundColorProperty,
    colorProperty,
    isUserInteractionEnabledProperty
} from '@nativescript/core';
import { FloatingActionButton } from '@nativescript-community/ui-material-floatingactionbutton';
import { Button } from '@nativescript-community/ui-material-button';
import { LinearGradient } from '@nativescript/core/ui/styling/gradient';
import { AnimationCurve } from '@nativescript/core/ui/enums';

export class SpeedDialItemBase extends GridLayout {}

const OPEN_DURATION = 200;
const CLOSE_DURATION = 100;

function transformAnimationValues(values: AnimationDefinition[]) {
    return values.map((value) => {
        const data: any = {};
        if (value.translate) {
            data.translationX = value.translate.x;
            data.translationY = value.translate.y;
        }
        if (value.scale) {
            data.scaleX = value.scale.x;
            data.scaleY = value.scale.y;
        }
        const { translate, scale, duration, curve, ...others } = value;
        Object.assign(data, others);
        return data;
    });
}

@CSSType('MDSpeedDialItemTitle')
export class SpeedDialItemTitle extends Button {
    constructor() {
        super();
        // this._fabsHolder.isPassThroughParentEnabled = true;
        this.verticalAlignment = 'middle';
    }
}
@CSSType('MDSpeedDialItemButton')
export class SpeedDialItemButton extends Button {
    constructor() {
        super();
        // this._fabsHolder.isPassThroughParentEnabled = true;
        this.verticalAlignment = 'middle';
    }
}
@CSSType('MDSpeedDialButton')
export class SpeedDialButton extends SpeedDialItemButton {}
@CSSType('MDSpeedDialItem')
export class SpeedDialItem extends SpeedDialItemBase {
    public actualActive: boolean = false;
    titleView: SpeedDialItemTitle;
    button: SpeedDialItemButton;
    fabmenu: WeakRef<SpeedDial>;
    constructor(size = 'mini', private isMain = false) {
        super();
        // this._fabsHolder.isPassThroughParentEnabled = true;
        this.titleView = new SpeedDialItemTitle();
        this.titleView.notify = this.notifyChildEvent(this.titleView, this.titleView.notify);
        this.titleView.col = 1;
        this.titleView.text = this.title;
        this.titleView.style['css:text-transform'] = 'none';
        this.titleView.style['css:background-color'] = 'white';
        this.titleView.style['css:ripple-color'] = '#797979';
        this.titleView.style['css:color'] = '#797979';
        this.titleView.style['css:elevation'] = 2;
        this.titleView.style['css:border-radius'] = 6;
        this.titleView.style['css:font-size'] = 10;
        this.titleView.style['css:min-width'] = 0;
        this.titleView.style['css:min-height'] = 0;
        this.titleView.style['css:padding'] = 4;
        this.button = isMain ? new SpeedDialButton() : new SpeedDialItemButton();
        this.button.notify = this.notifyChildEvent(this.button, this.button.notify);
        this.button.horizontalAlignment = 'center';
        // this.fabButtonTitle.style['css:elevation'] = 4;this.fabButtonTitle.style['css:elevation'] = 2;
        this.button.style['css:font-size'] = 26;
        this.button.style['css:border-radius'] = 28;
        this.button.style['css:width'] = 56;
        this.button.style['css:height'] = 56;
        this.button.style['css:margin'] = 16;
        this.button.style['css:dynamic-elevation-offset'] = 2;
        this.button.col = this.fabButtonCol;
        this.button.style['css:font-size'] = 26;
        if (size === 'mini') {
            this.button.style['css:border-radius'] = 20;
            this.button.style['css:width'] = 40;
            this.button.style['css:height'] = 40;
            this.button.style['css:margin'] = 16;
            this.button.style['css:dynamic-elevation-offset'] = 2;
        } else {
            this.button.style['css:border-radius'] = 28;
            this.button.style['css:width'] = 56;
            this.button.style['css:height'] = 56;
            this.button.style['css:margin'] = 16;
            this.button.style['css:dynamic-elevation-offset'] = 4;
        }
        (this as any).columns = this.fabColumns;
        this.addChild(this.titleView);
        this.addChild(this.button);
    }
    initNativeView() {
        super.initNativeView();
        this.titleView.on('tap', this.onButtonTap, this);
        this.button.on('tap', this.onButtonTap, this);
    }
    disposeNativeView() {
        super.disposeNativeView();
        this.titleView.off('tap', this.onButtonTap, this);
        this.button.off('tap', this.onButtonTap, this);
    }

    notifyChildEvent(child, superNotifyMethod) {
        return (event: EventData) => {
            (event as any).speeddialItem = this;
            if (event.eventName === 'tap') {
                if (this.isMain) {
                    this.fabmenu.get().onButtonTap(event);
                } else {
                    this.fabmenu.get().active = false;
                }
            }
            superNotifyMethod.call(child, event);
        };
    }
    get fabButtonCol() {
        return this.isRight ? 2 : 0;
    }
    onButtonTap(args) {
        if (this.isMain) {
            this.fabmenu.get().onButtonTap(args);
        } else {
            console.log('onButtonTap', this, args.eventName, this.hasListeners(args.eventName));
            this.notify({ object: this, ...args });
            this.fabmenu.get().active = false;
        }
    }
    get isLeft() {
        return this.fabmenu && this.fabmenu.get().isLeft;
    }
    get isRight() {
        return this.fabmenu && this.fabmenu.get().isRight;
    }
    get fabColumns() {
        return this.isRight ? '*,auto,60' : '60,auto,*';
    }
    get active() {
        return this.fabmenu && this.fabmenu.get().active;
    }
    set active(value) {
        if (this.fabmenu) {
            this.fabmenu.get().active = value;
        }
    }

    [isUserInteractionEnabledProperty.setNative](value) {
        super[isUserInteractionEnabledProperty.setNative](value);
        this.button.isUserInteractionEnabled = value;
        this.titleView.isUserInteractionEnabled = value;
    }
    // get size() {
    //     return this._fabButton.size;
    // }
    // set size(value) {
    //     this._fabButton.size = value;
    // }
    get title() {
        return this.titleView.text;
    }
    set title(value: string) {
        this.titleView.text = value;
    }
    get text() {
        return this.button.text;
    }
    set text(value: string) {
        this.button.text = value;
    }
    //@ts-ignore
    get icon() {
        return this.button.src;
    }
    set icon(value: string | ImageSource) {
        this.button.src = value;
    }
    get buttonClass() {
        return this.button.className;
    }
    set buttonClass(value: string) {
        this.button.className = value;
    }
    get titleClass() {
        return this.titleView.className;
    }
    set titleClass(value: string) {
        this.titleView.className = value;
    }
    //@ts-ignore
    get backgroundColor() {
        return this.button.backgroundColor;
    }
    set backgroundColor(value: string | Color) {
        this.button.backgroundColor = value;
    }

    //@ts-ignore
    get backgroundImage() {
        return this.button && this.button.backgroundImage;
    }
    set backgroundImage(value: string | LinearGradient) {
        if (this.button) {
            this.button.backgroundImage = value;
        }
    }
    //@ts-ignore
    get color() {
        return this.button && this.button.color;
    }
    set color(value) {
        if (this.button) {
            this.button.color = value;
        }
    }
    //@ts-ignore
    get buttonFontSize() {
        return this.button.fontSize;
    }
    set buttonFontSize(value) {
        this.button.fontSize = value;
    }
    public addEventListener(arg: string, callback: (data: EventData) => void, thisArg?: any) {
        // we want to trap tap events
        if (arg === 'tap') {
            this.button.addEventListener(arg, callback, thisArg);
            this.titleView.addEventListener(arg, callback, thisArg);
        } else {
            super.addEventListener(arg, callback, thisArg);
        }
    }
}

@CSSType('MDSpeedDial')
export class SpeedDial extends SpeedDialItemBase {
    fabs: SpeedDialItem[] = [];
    private _fabsHolder: FlexboxLayout;
    rows: string;
    columns: string;
    rPosition = 'left';
    orientation = 'vertical';
    isActive = false;
    actualActive = false;
    private _fabMainButton: SpeedDialItem;
    constructor() {
        super();
        this.actualActive = this.isActive;
        this.backgroundColor = new Color('#00000000');
        this.width = { unit: '%', value: 100 };
        this.height = { unit: '%', value: 100 };
        this.rows = 'auto,*,auto,auto';
        this.style['css:padding-left'] = 8;
        this.style['css:padding-right'] = 8;
        this._fabsHolder = new FlexboxLayout();
        this._fabsHolder.row = 2;
        this._fabsHolder.horizontalAlignment = this.rPosition as HorizontalAlignment;
        if (global.isIOS) {
            this._fabsHolder.isPassThroughParentEnabled = true;
        }
        this._fabsHolder.flexDirection = this.orientation === 'vertical' ? 'column-reverse' : 'row-reverse';

        this._fabMainButton = new SpeedDialItem(null, true);
        this.prepareItem(this._fabMainButton, true);
        this._fabMainButton.row = 3;

        this._fabsHolder.horizontalAlignment = this.rPosition as HorizontalAlignment;

        this.addChild(this._fabMainButton);
        this.addChild(this._fabsHolder);
    }

    initNativeView() {
        super.initNativeView();
        this._fabMainButton.on('tap', this.onButtonTap, this);
    }
    disposeNativeView() {
        super.disposeNativeView();
        this._fabMainButton.off('tap', this.onButtonTap, this);
    }

    prepareItem(item: SpeedDialItem, isMain = false) {
        item.fabmenu = new WeakRef(this);
        const animationData = this.computeAnimationData('hide', item, this.fabs.length, Math.max(this.fabs.length, 1), OPEN_DURATION, isMain);
        transformAnimationValues(animationData).forEach((d) => {
            const { target, ...others } = d;
            if (target === item.button && !isMain) {
                Object.assign(item.button, others);
            } else if (target === item.titleView) {
                Object.assign(item.titleView, others);
            }
        });
    }
    addChild(child) {
        // for now we ignore this
        // to make sure we add the view in the property change
        // this is to make sure the view does not get "visible" too quickly
        // before we apply the translation
        // super.addChild(child);
        if (child !== this._fabMainButton && child instanceof SpeedDialItem) {
            this.prepareItem(child);

            this.fabs.push(child);
            this._fabsHolder.addChild(child);
        } else {
            super.addChild(child);
        }
    }
    public _addChildFromBuilder(name: string, value: any) {
        console.log('_addChildFromBuilder', name);
        if (value instanceof SpeedDialItem) {
            value.fabmenu = new WeakRef(this);
            this.fabs.push(value);
            this._fabsHolder._addView(value);
        } else {
            this._addView(value);
        }
    }
    get isLeft() {
        return this.rPosition === 'left';
    }
    get isRight() {
        return this.rPosition === 'right';
    }
    onButtonTap(args) {
        this.active = !this.active;
    }
    computeAnimationData(way: 'open' | 'hide', fab: SpeedDialItem, index, count, duration, isMain = false): AnimationDefinition[] {
        const delay = (duration / count) * index;
        const curve = AnimationCurve.easeOut;
        if (way === 'open') {
            const result: AnimationDefinition[] = [
                {
                    target: fab.titleView,
                    opacity: fab.titleView.text ? 1 : 0,
                    duration,
                    curve,
                    translate: {
                        y: 0,
                        x: 0
                    },
                    delay
                }
            ];
            if (!isMain) {
                result.push({
                    target: fab.button,
                    duration,
                    curve,
                    opacity: 1,
                    scale: {
                        y: 1,
                        x: 1
                    },
                    delay
                });
            }
            return result;
        } else {
            const result: AnimationDefinition[] = [
                {
                    target: fab.titleView,
                    opacity: 0,
                    curve,
                    duration,
                    translate: {
                        y: 0,
                        x: -20
                    },
                    delay
                }
            ];
            if (!isMain) {
                result.push({
                    target: fab.button,
                    duration,
                    curve,
                    opacity: 0,
                    scale: {
                        y: 0.5,
                        x: 0.5
                    },
                    delay
                });
            }
            return result;
        }
    }
    async show(duration = OPEN_DURATION) {
        this.animating = true;
        const fabs = this.fabs;
        const length = fabs.length;
        const params = fabs
            .reduce((acc, fab, index) => {
                acc.push(...this.computeAnimationData('open', fab, index, length, duration));
                return acc;
            }, [] as AnimationDefinition[])
            .filter((a) => !!a)
            .concat(this.computeAnimationData('open', this._fabMainButton, 0, length, duration, true))
            .concat([
                {
                    target: this,
                    backgroundColor: new Color('#99000000'),
                    curve: AnimationCurve.easeInOut,
                    duration
                }
            ]);

        try {
            await new Animation(params).play();
            fabs.forEach((f) => (f.isUserInteractionEnabled = true));
        } catch (err) {
            // console.error(err);
        } finally {
            this.animating = false;
        }
    }
    animating = false;
    async hide(duration = CLOSE_DURATION) {
        this.animating = true;
        const fabs = this.fabs;
        const length = fabs.length;
        const params = fabs
            .reduce((acc, fab, index) => {
                acc.push(...this.computeAnimationData('hide', fab, length - 1 - index, length, duration));
                return acc;
            }, [] as AnimationDefinition[])
            .filter((a) => !!a)
            .concat(this.computeAnimationData('hide', this._fabMainButton, 0, length, duration, true))
            .concat([
                {
                    target: this,
                    backgroundColor: new Color('#00000000'),
                    curve: AnimationCurve.easeInOut,
                    duration
                }
            ]);

        try {
            fabs.forEach((f) => (f.isUserInteractionEnabled = false));
            await new Animation(params).play();
        } catch (err) {
            // console.error(err);
        } finally {
            this.animating = false;
        }
    }
    get active() {
        return this.actualActive;
    }
    set active(value) {
        if (this.animating || value === this.actualActive) {
            return;
        }
        this.actualActive = value;
        if (value) {
            this.show();
        } else {
            this.hide();
        }
        this.notify({
            eventName: 'activeChange',
            object: this,
            propertyName: 'active',
            value
        });
    }

    //@ts-ignore
    get icon() {
        return this._fabMainButton.icon;
    }
    set icon(value: string | ImageSource) {
        this._fabMainButton.icon = value;
    }
    set buttonIcon(value: string | ImageSource) {
        this._fabMainButton.icon = value;
    }
    get buttonClass() {
        return this._fabMainButton.buttonClass;
    }
    set buttonClass(value: string) {
        this._fabMainButton.buttonClass = value;
    }
    get buttonFontSize() {
        return this._fabMainButton.buttonFontSize;
    }
    set buttonFontSize(value) {
        this._fabMainButton.buttonFontSize = value;
    }

    //@ts-ignore
    get color() {
        return this._fabMainButton.color;
    }
    set color(value) {
        this._fabMainButton.color = value;
    }
    get text() {
        return this.text && this._fabMainButton.text;
    }
    set text(value: string) {
        if (this._fabMainButton) {
            this._fabMainButton.text = value;
        }
    }
    get title() {
        return this._fabMainButton && this._fabMainButton.title;
    }
    set title(value: string) {
        if (this._fabMainButton) {
            this._fabMainButton.title = value;
        }
    }
    //@ts-ignore
    get buttonBackgroundColor() {
        return this._fabMainButton && this._fabMainButton.backgroundColor;
    }
    set buttonBackgroundColor(value: string | Color) {
        if (this._fabMainButton) {
            this._fabMainButton.backgroundColor = value;
        }
    }
    //@ts-ignore
    get buttonBackgroundImage() {
        return this._fabMainButton && this._fabMainButton.backgroundImage;
    }
    set buttonBackgroundImage(value: string | LinearGradient) {
        if (this._fabMainButton) {
            this._fabMainButton.backgroundImage = value;
        }
    }

    get titleClass() {
        return this._fabMainButton.titleClass;
    }
    set titleClass(value: string) {
        this._fabMainButton.titleClass = value;
    }

    onBackdropTap(args) {
        this.active = false;
    }
}