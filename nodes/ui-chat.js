module.exports = function (RED) {
    function UIChatNode (config) {
        RED.nodes.createNode(this, config)

        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const base = group.getBase()

        // server-side event handlers
        const evts = {
            onAction: true,
            beforeSend: function (msg) {
                // check for any dynamic properties being set
                // const updates = msg.ui_update
                return msg
            },
            onInput: function (msg, send, done) {
                // store the latest value in our Node-RED datastore
                base.stores.data.save(base, node, msg)
                // we do not then send this on as only submitted messages via UI should go further
            }
        }

        // inform the dashboard UI that we are adding this node
        if (group) {
            group.register(node, config, evts)
        } else {
            node.error('No group configured')
        }
    }

    RED.nodes.registerType('ui-chat', UIChatNode)
}
