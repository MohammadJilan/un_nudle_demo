class panel {
    constructor(ui, content) {
        this.card = new BABYLON.GUI.Rectangle()
        this.card.width = "320px"
        this.card.height = "140px"
        this.card.thickness = 0
        this.card.cornerRadius = 25
        this.card.background = "rgba(20,20,20,0.55)"
        this.card.shadowBlur = 25
        this.card.shadowColor = "black"
        this.card.shadowOffsetX = 0
        this.card.shadowOffsetY = 10

        ui.addControl(this.card)

        var textBlock = new BABYLON.GUI.TextBlock()
        textBlock.text = content
        textBlock.color = "white"
        textBlock.fontSize = "12px"
        textBlock.textWrapping = true
        textBlock.paddingLeft = "25px"
        textBlock.paddingRight = "25px"
        textBlock.paddingTop = "20px"
        this.card.addControl(textBlock)

        this.card.onPointerClickObservable.add(() => this.hide())

        this.hide()
    }

    pop(mesh) {
        let offset = new BABYLON.Vector3(0.35, 0.35, 0)
        let node = new BABYLON.TransformNode("PanelFollowNode", mesh.getScene())
        node.position = mesh.position.add(offset)
        node.parent = mesh.parent

        this.card.linkWithMesh(node)
        this.card.isVisible = true
        this._linkNode = node
    }

    hide() {
        this.card.isVisible = false
        if (this._linkNode) {
            this._linkNode.dispose()
            this._linkNode = null
        }
    }
}

export default class InfoPoint {
    static all = [];
    static _open = null;

    constructor(color, textChar, advancedTexture, scene) {
        const circle = BABYLON.GUI.Button.CreateSimpleButton("but1", "1")
        circle.width = "40px"
        circle.height = "40px"
        circle.cornerRadius = 20
        circle.color = "white"
        circle.thickness = 4
        circle.background = color
        circle.alpha = 0.3

        circle.onPointerEnterObservable.add(() => circle.alpha = 1)
        circle.onPointerOutObservable.add(() => circle.alpha = 0.3)

        const label = new BABYLON.GUI.TextBlock()
        label.text = textChar
        circle.addControl(label)

        advancedTexture.addControl(circle)

        this.circle = circle
        this.label = label
        this.scene = scene
        this.advancedTexture = advancedTexture

        this.description = ""
        this.panel = null
        this.node = null

        this.circle.onPointerDownObservable.add(() => {
            this.expand()
        })

        InfoPoint.all.push(this)
    }

    setPosition(rootNode, position) {
        this.node = new BABYLON.TransformNode("InfoNode", this.scene)
        this.node.parent = rootNode
        this.node.position = position
        this.circle.linkWithMesh(this.node)
    }

    set(description) {
        this.description = description
        this.panel = new panel(this.advancedTexture, description)
    }

    expand() {
        // if this panel is already open, toggle close
        if (InfoPoint._open === this) {
            this._collapse()
            InfoPoint._open = null
            return
        }

        // Close all other panels
        InfoPoint._collapseAll()

        // Open this one
        if (this.panel && this.node) {
            this.panel.pop(this.node)
        }

        InfoPoint._open = this
    }

    _collapse() {
        if (this.panel) {
            this.panel.hide()
        }
    }

    static _collapseAll() {
        for (let p of InfoPoint.all) {
            if (p.panel) p.panel.hide()
        }
        InfoPoint._open = null
    }

    dispose() {
        if (this.circle) this.circle.dispose()
        if (this.node) this.node.dispose()
        if (this.panel) this.panel.hide()

        InfoPoint.all = InfoPoint.all.filter(i => i !== this)
    }

    get() {
        return this.circle
    }
}