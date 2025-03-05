import * as csstree from 'css-tree';

const link = document.querySelector('link[rel="stylesheet"][href*="wp-admin/load-styles.php"]')
if (link) {
    fetch(link.href)
        .then(res => res.text())
        .then(css => {
            const style = document.createElement('style')
            style.textContent = dontTouchMe(css);
            document.head.prepend(style)
            link.remove()
        })
}

function dontTouchMe(css) {
    const ast = csstree.parse(css);

    csstree.walk(ast, {
        enter: (node, item, list) => {
            if (node.type === 'Atrule' && node.name === 'keyframes') {
                return csstree.walk.skip;
            }

            if (node.type === 'SelectorList') {
                node.children.forEach(selector => {
                    if (selector.children.some(child => child.type === 'PseudoClassSelector')) {
                        return;
                    }

                    // // add :not(#wpbody)
                    // selector.children.push({
                    //     type: 'PseudoClassSelector',
                    //     name: 'not',
                    //     children: [
                    //         {
                    //             type: 'IdSelector',
                    //             name: 'wpbody'
                    //         }
                    //     ]
                    // })

                    // add :not(#wpbody *)
                    selector.children.push({
                        type: 'PseudoClassSelector',
                        name: 'not',
                        children: [
                            {
                                type: 'IdSelector',
                                name: 'wpbody'
                            },
                            {
                                type: 'Combinator',
                                name: ' '
                            },
                            {
                                type: 'TypeSelector',
                                name: '*'
                            }
                        ]
                    })
                });
            }
        }
    });

    return csstree.generate(ast);
}

document.body.classList.add('folded')
