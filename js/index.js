// 获取 GitHub Actions 中设置的 Secret Token
// const token = window.GITHUB_TOKEN;
// const test = process.env.token;

// https://run.mocky.io/v3/5a1da7e9-baa6-48ae-ac73-71aed3b4c384
// del https://designer.mocky.io/manage/delete/5a1da7e9-baa6-48ae-ac73-71aed3b4c384/jdaTGXsvFyxM8fKcrcM8J4lJFHOX1axM1OUB

const repoOwner = 'nameZh1';//'YOUR_GITHUB_USERNAME';账户名
const repoName = 'img';//'YOUR_REPOSITORY_NAME';仓库名
// 创建全局变量(当前所在路径)
var curryPath = '/';
const curryPathEle = document.getElementById('curryPath');
const imageInput = document.getElementById('imageInput'); // 获取图像文件上传输入元素
const treeShowEle = document.getElementById('treeShow');
const imgShowEle = document.getElementById('imgShow');
const bodyEle = document.getElementsByTagName('body');
var token;

fetch('https://run.mocky.io/v3/5a1da7e9-baa6-48ae-ac73-71aed3b4c384', {
    method: 'POST',
    headers: {
        'Content-type': 'application/json; charset=UTF-8',
    },
}).then((response) => response.json()).then((json) => {
    token = json.flag;
    go();
});

function go(index) {
    // add('img/icon');
    // del('img/1.jpg');
    // search();
    // getShaForFile('img/1.jpg');
    // searchTree('');
    // console.log(index, 'from test')
    getFolde('img');
}

/**
 * 绑定事件 
 * author:zh1
 * date:2023年10月23日
 * */
document.getElementById('uploadButton').addEventListener('click', () => {
    add(curryPath);
    return;
});

/**
 * 增
 * 在guthub仓库中上传文件
 * 地址不存在时候，会自动创建文件夹
 * author:zh1
 * date:2023年10月23日
 */
function add(pathDir) {
    // 检查用户是否选择了文件
    if (imageInput.files.length === 0) {
        // 如果没有选择文件，显示提示并终止操作
        popShow('请先选择要上传的图像文件');
        return;
    }
    if (pathDir == '/') {
        popShow('请先选择文件夹');
        return;
    }

    const file = imageInput.files[0]; // 获取用户选择的第一个图像文件

    const formData = new FormData(); // 创建 FormData 对象，用于构建要上传的数据
    formData.append('file', file); // 将选定的文件添加到 FormData 对象中，使用 "file" 作为字段名称

    const reader = new FileReader(); // 创建 FileReader 对象，用于读取文件内容
    reader.readAsDataURL(file); // 读取文件内容并将其以DataURL格式读取

    reader.onload = function () {
        const content = reader.result.split(',')[1]; // 获取Base64编码后的文件内容

        // 使用 fetch 方法向 GitHub 的 API 端点发送 PUT 请求，将图像文件内容上传到指定的 GitHub 仓库
        fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${pathDir}/${file.name}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`, // 使用 GitHub 访问令牌进行身份验证
            },
            body: JSON.stringify({
                message: 'Upload image',
                content: content, // 使用Base64编码后的内容
                branch: 'master', // 分支名称，通常为 'main' 或 'master'
            }),
        }).then(res => {
            console.log(res, 'sss')
            if (res.ok) {
                popShow('上传成功');
                return res.json()
            }
            if (res.status == 422) {
                popShow('上传失败,命名重复');
                return false;
            }
        }).then(data => {
            console.log(data, 'JSON数据')
        }).catch(error => {
            popShow('上传失败');
            console.error(error);
        });
    };
}

/**
 * 删
 * 删除github仓库的某个文件
 * 文件夹中文件删完就自动删除文件夹了（暂无批量
 * author:zh1
 * date:2023年10月23日
 */
// 通过 GitHub API 获取文件的 SHA(SHA为删除仓库文件的必须参数)
async function getShaForFile(filePath) {
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const headers = {
        'Authorization': `token ${token}`,
    };

    const response = await fetch(apiUrl, {
        headers,
    }).then(response => {
        if (response.ok) {
            return response.json()
        } else {
            // popUp('获取文件 SHA 失败');
            popShow('获取文件 SHA 失败');
            return null;
        }
    }).then(data => {
        return data
    });
    return response;
}

async function del(filePath) {
    // 获取文件的 SHA
    const sha = await getShaForFile(filePath);
    console.log("🚀 ~ file: index.js:93 ~ del ~ sha:", sha)

    if (sha) {
        // 使用 SHA 删除文件
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
        const headers = {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
        };

        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({
                message: 'Delete file',
                sha: sha.sha, // 提供 SHA
            }),
        });

        if (response.ok) {
            // popUp('文件删除成功')
            popShow('文件删除成功')
        } else {
            // popUp('文件删除失败')
            popShow('文件删除失败')
        }
    } else {
        console.log('SHA不存在')
    }
}

async function delBySha(filePath, sha) {
    console.log(filePath, sha, 'aaaaa')
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const headers = {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
            message: 'Delete file',
            sha: sha.sha, // 提供 SHA
        }),
    });

    if (response.ok) {
        // popUp('文件删除成功');
        popShow('文件删除成功')
    } else {
        // popUp('文件删除失败');
        popShow('文件删除失败')
    }
}




/**
 * 查
 * 获取github仓库的树结构
 * author:zh1
 * date:2023年10月23日
 */
// 有下载地址，适合图片懒加载
async function search() {
    const path = ''; // 设置为空以获取整个仓库内容，或指定路径以获取特定目录
    // 构建 API 请求的 URL
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;

    // 设置请求头，包括 GitHub 令牌
    const headers = {
        Authorization: `token ${token}`
    };

    // 树的文档片段
    const treeFragment = document.createDocumentFragment();

    // 发起 GET 请求获取仓库内容
    fetch(apiUrl, { headers })
        .then(response => response.json())
        .then(data => {
            console.log(data, 'qqq')
            let element = document.createElement('div');
            element.textContent = data[0].name;
            element.className = 'imgContainer-content-left-treeNode';
            treeFragment.appendChild(element);
            // 遍历并输出文件和目录
            listContents(data);
        })
        .catch(error => console.error('发生错误：', error));

    // 遍历并输出文件和目录
    function listContents(contents, level = 0) {
        contents.forEach(item => {
            const indent = '  '.repeat(level);
            if (item.type === 'dir') {
                // 递归获取子目录内容
                fetch(item.url, { headers })
                    .then(response => response.json())
                    .then(subContents => {
                        // listContents(subContents, level + 1);
                        console.log(subContents, 'sub')
                        subContents.forEach(subItem => {
                            if (subItem.type == "dir") {
                                let element = document.createElement('div');
                                element.textContent = subItem.name;
                                element.setAttribute('url', subItem.git_url);
                                element.className = 'imgContainer-content-left-treeNode';
                                treeFragment.appendChild(element);
                            }
                        })
                        treeShowEle.appendChild(treeFragment);
                    })
                    .catch(error => console.error('获取子目录内容时出错：', error));
            }
        });
    }
}

// 树结构
async function searchTree(filePath) {
    const TREE_SHA_LIST = await getShaForFile(filePath);
    // const TREE_SHA = TREE_SHA_LIST[0].sha
    console.log("🚀 ~ file: index.js:185 ~ searchTree ~ TREE_SHA:", TREE_SHA_LIST)
    // const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/${TREE_SHA}`;
    const apiUrl = TREE_SHA_LIST[0].git_url;
    const headers = {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
    };

    fetch(apiUrl, {
        method: 'GET',
        headers,
    })
        .then(response => response.json())
        .then(data => {
            // 这里可以处理从 GitHub 获取的数据（data）
            console.log(data, 'tree')
        })
        .catch(error => {
            console.error(error);
        });

}

// 非树结构
function getFolde(path) {
    // const path = ''; // 设置为空以获取整个仓库内容，或指定路径以获取特定目录
    // 构建 API 请求的 URL
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;
    // 设置请求头，包括 GitHub 令牌
    const headers = {
        Authorization: `token ${token}`
    };
    // 树的文档片段
    const treeFragment = document.createDocumentFragment();
    // 发起 GET 请求获取仓库内容
    fetch(apiUrl, { headers })
        .then(response => response.json())
        .then(data => {
            data.forEach(subItem => {
                if (subItem.type == "dir") {
                    let element = document.createElement('div');
                    element.textContent = subItem.name;
                    element.setAttribute('path', subItem.path);
                    element.className = 'imgContainer-content-left-foldeNode';
                    // 点击文件夹时间
                    element.addEventListener('click', function (index) {
                        const path = index.target.getAttribute('path');
                        curryPath = path;
                        curryPathEle.textContent = path;
                        getImg(path);
                    });
                    treeFragment.appendChild(element);
                    treeFragment.appendChild(element);
                    treeFragment.appendChild(element);
                }
            })
            treeShowEle.appendChild(treeFragment);

        })
        .catch(error => console.error('发生错误：', error));
}




/**
 * 渲染图片
 * author:zh1
 * date:2023年10月23日
 */

function getImg(path) {
    //清理
    while (imgShowEle.firstChild) {
        imgShowEle.removeChild(imgShowEle.firstChild);
    }
    //更新
    // 使用使用文档片段可以优化批量dom操作
    const fragment = document.createDocumentFragment();
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;
    const headers = {
        Authorization: `token ${token}`
    };
    fetch(apiUrl, { headers }).then(response => response.json())
        .then(data => {
            data.forEach(item => {
                if (item.type == 'file') {
                    // 父容器
                    const eleContainer = document.createElement('div');
                    // 图片
                    const element = document.createElement('img');
                    // 文本标签
                    const nameTag = document.createElement('span');
                    // 关闭按钮
                    const quitBt = document.createElement('div');
                    quitBt.textContent = '×';
                    quitBt.setAttribute('path', item.path);
                    quitBt.setAttribute('sha', item.sha);
                    quitBt.addEventListener('click', function (index) {
                        // 这里可以定义点击事件的处理逻辑
                        console.log(index, '图片被shanchu');
                        del(index.target.getAttribute('path'));
                        // delBySha(index.target.getAttribute('path'), index.target.getAttribute('sha'));
                    });
                    eleContainer.className = 'imgContainer-content-mid-imgShow-item';
                    element.width = "100%";
                    element.height = "100%";
                    element.src = item.download_url; // 设置图片路径
                    element.setAttribute('download_url', item.download_url);
                    element.setAttribute('name', item.name);
                    element.className = 'imgContainer-content-mid-imgShow-itemImg';
                    element.alt = '点击下载图片';
                    element.addEventListener('click', function (index) {
                        // 这里可以定义点击事件的处理逻辑
                        console.log(index, '图片被点击了');
                        // window.open(index.target.getAttribute('download_url'), '_blank');
                        const downloadLink = document.createElement('a');
                        downloadLink.href = index.target.getAttribute('download_url');
                        downloadLink.target = '_blank';
                        downloadLink.download = index.target.getAttribute('name');; // 设置下载的文件名
                        downloadLink.click();
                    });
                    nameTag.className = 'imgContainer-content-mid-imgShow-itemTitle';
                    nameTag.textContent = item.name;
                    quitBt.className = 'imgContainer-content-mid-imgShow-itemQuit';
                    eleContainer.appendChild(element);
                    eleContainer.appendChild(nameTag);
                    eleContainer.appendChild(quitBt);
                    fragment.appendChild(eleContainer);
                }
            });
            imgShowEle.appendChild(fragment);
        })
}

/**
 * 提示弹框
 * author:zh1
 * date:2023年10月25日
 */
function popUp(text) {
    const popCon = document.createElement('div');
    const popWin = document.createElement('div');
    const popTitle = document.createElement('div');
    const popText = document.createElement('div');

    popCon.className = 'popUp-container';
    popCon.id = 'popUp-container'
    popCon.addEventListener('click', function (index) {
        console.log(index, 'close')
        index.target.remove();
    });

    popWin.className = 'popUp-container-window';

    popTitle.className = 'popUp-container-window-title'
    popTitle.textContent = '通知';

    popText.className = 'popUp-container-window-text'
    popText.textContent = text;

    // popWin.textContent = 'test'; 
    popCon.appendChild(popWin);
    popWin.appendChild(popTitle);
    popWin.appendChild(popText);
    bodyEle[0].appendChild(popCon);

    setTimeout(() => {
        popCon.remove();
    }, 3000);
}
// 隐藏版
function popShow(text) {
    let popText = document.getElementById('popUp-container-text');
    let popCon = document.getElementById('popUp-container');
    popCon.style.opacity = 1;
    popText.textContent = text;
    setTimeout(() => {
        popCon.style.opacity = 0;
    }, 2000);
}



