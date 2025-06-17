



## generateFlowNodeTaskSourceCodeWhenMultiOutput最终效果完整示例

让我通过一个具体的业务场景来展示这个方法生成的最终Java代码效果：

### 业务场景
假设有一个**年龄判断节点**，根据用户年龄决定不同的处理流程：
- 端口1：年龄 < 18，跳转到"未成年处理节点"
- 端口2：年龄 >= 18 && 年龄 < 60，跳转到"成年人处理节点"
- 端口3：年龄 >= 60，跳转到"老年人处理节点"

### 输入数据
```java
// 当前节点ID
curNodeId = "node_age_judge_001"

// 端口配置
curPorts = [
    VsPort{id="port_001", properties="{\"script\":\"return age < 18;\"}"}
    VsPort{id="port_002", properties="{\"script\":\"return age >= 18 && age < 60;\"}"}
    VsPort{id="port_003", properties="{\"script\":\"return age >= 60;\"}"}
]

// 链接配置
curLinks = [
    VsLink{sourcePort="port_001", targetId="node_minor_handler"}
    VsLink{sourcePort="port_002", targetId="node_adult_handler"}
    VsLink{sourcePort="port_003", targetId="node_senior_handler"}
]
```

### 生成的最终Java代码

```java
package com.cmii.ip.vs.flow;

import java.io.*;
import java.nio.charset.*;
import java.util.*;
import java.time.*;
import java.text.*;
import java.net.*;
import java.util.concurrent.*;

import lombok.extern.slf4j.Slf4j;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.core.*;
import com.fasterxml.jackson.core.type.*;
import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;

import org.apache.http.Header;
import org.apache.http.HttpResponse;
import org.apache.http.message.BasicHeader;
import org.apache.http.util.EntityUtils;

import org.hl7.fhir.r5.model.*;

import org.springframework.util.*;

import com.cmii.ip.common.exception.*;
import com.cmii.ip.common.utils.http.*;
import com.cmii.ip.common.utils.*;
import com.cmii.ip.common.utils.fhir.*;
import com.cmii.ip.common.enums.vs.*;

/**
 * class name: FlowNode_node_age_judge_001
 */
@Slf4j
public class FlowNode_node_age_judge_001 extends FlowNodeTask implements Serializable {

    public FlowNode_node_age_judge_001(String nodeId, String body,
                                      Map<String, String> requestHeader,
                                      Map<String, String> requestParam,
                                      Map<String, String> responseHeader) {
        super(nodeId, body, requestHeader, requestParam, responseHeader);
    }

    @Override
    public void call() {
        // 默认方法体设置
        setDefaultMethodBody();

        // 按顺序检查每个端口条件
        if (port_001()) {
            this.setActivatedNodeId("node_minor_handler");
            return;
        }
        if (port_002()) {
            this.setActivatedNodeId("node_adult_handler");
            return;
        }
        if (port_003()) {
            this.setActivatedNodeId("node_senior_handler");
            return;
        }
    }

    // 布尔判断方法 - 端口1：未成年判断
    public boolean port_001() {
        return age < 18;
    }

    // 布尔判断方法 - 端口2：成年人判断
    public boolean port_002() {
        return age >= 18 && age < 60;
    }

    // 布尔判断方法 - 端口3：老年人判断
    public boolean port_003() {
        return age >= 60;
    }

    // 附加定义（如果端口有额外的方法定义）
    // 这里可能包含一些辅助方法或变量定义
}
```

### 运行时执行流程

1. **节点被调用**：`call()`方法被执行
2. **设置默认方法体**：执行一些初始化操作
3. **条件判断**：
   - 首先调用`port_001()`，如果年龄<18，激活"未成年处理节点"并返回
   - 如果条件不满足，继续调用`port_002()`，如果18≤年龄<60，激活"成年人处理节点"并返回
   - 如果前面条件都不满足，调用`port_003()`，如果年龄≥60，激活"老年人处理节点"并返回

### 实际业务效果

假设输入数据中`age = 25`：
1. `port_001()`返回false（25不小于18）
2. `port_002()`返回true（25>=18且<60）
3. 设置`activatedNodeId = "node_adult_handler"`
4. 流程跳转到成年人处理节点

这样就实现了**基于年龄的智能路由分发**，根据不同的年龄段将流程导向不同的处理逻辑，这是流程引擎中条件分支节点的典型应用场景。
