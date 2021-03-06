const rcmail = global.rcmail;

/**
 * Get the attachment information by given ID.
 *
 * @param  {string} attachmentId The attachment identifier
 * @return {?Object.<string, any>} The attachment information.
 */
const getAttachmentInfo = (attachmentId) => {
  let attachments = rcmail.env['cloudview.attachments'] || {};

  return attachments[attachmentId] || null;
};

rcmail.addEventListener('init', (evt) => {
  // register the main command
  rcmail.register_command(
    'plugin.cloudview-open-attachment',
    () => {
      let attachmentId = rcmail.env['cloudview.target-attachment-id'];
      let attachment = getAttachmentInfo(attachmentId);

      rcmail.http_post(
        'plugin.cloudview-view',
        {
          _uid: rcmail.env.uid,
          _mbox: rcmail.env.mailbox,
          _info: JSON.stringify(attachment),
        },
        rcmail.set_busy(true, 'loading')
      );
    },
    false // disabled by default
  );

  // enable/disable the button in 'attachmentmenu'
  rcmail.addEventListener('menu-open', (evt) => {
    if (evt.name !== 'attachmentmenu') return;

    let attachmentId = evt.props.id;
    let attachment = getAttachmentInfo(evt.props.id);

    rcmail.set_env('cloudview.target-attachment-id', attachmentId);
    rcmail.enable_command('plugin.cloudview-open-attachment', attachment['is_supported']);
  });

  // open the cloud viewer window
  rcmail.addEventListener('plugin.cloudview-view', (response) => {
    let windowSpecs = {
      width: window.innerWidth,
      height: window.innerHeight,
      directories: 'no',
      location: 'no',
      menubar: 'no',
      resizable: 'yes',
      scrollbars: 'no',
      status: 'no',
      toolbar: 'no',
    };

    window.open(
      response.message.url,
      new Date().getTime(),
      Object.keys(windowSpecs)
        .map((key) => `${key}=${windowSpecs[key]}`)
        .join(',')
    );
  });
});
