import pickle
import collections
import math
import operator

def entropy(data):
    frequency = collections.Counter([item[-1] for item in data])

    def item_entropy(category):
        ratio = float(category) / len(data)
        return -1 * ratio * math.log(ratio, 2)

    return sum(item_entropy(c) for c in frequency.values())


def best_feature_for_split(data):

    def feature_entropy(f):
        def e(v):
            partitioned_data = [d for d in data if d[f] == v]
            proportion = (float(len(partitioned_data)) / float(len(data)))
            return proportion * entropy(partitioned_data)
        return sum(e(v) for v in set([d[f] for d in data]))

    features = len(data[0]) - 1

    baseline = entropy(data)
    information_gain = [baseline - feature_entropy(f) for f in range(features)]
    best_feature, best_gain = max(enumerate(information_gain), key = operator.itemgetter(1))
    return best_feature

def potential_leaf_node(data):
    count = collections.Counter([i[-1] for i in data])
    return count.most_common(1)[0]

def create_tree(data, label):
    category, count = potential_leaf_node(data)
    if count == len(data):
        return category
    node = {}
    feature = best_feature_for_split(data)
    feature_label = label[feature]
    node[feature_label]={}
    classes = set([d[feature] for d in data])
    for c in classes:
        partitioned_data = [d for d in data if d[feature]==c]
        node[feature_label][c] = create_tree(partitioned_data, label)
    return node

def classify(tree, label, data):
    root = list(tree.keys())[0]
    node = tree[root]
    index = label.index(root)
    for k in node.keys():
        if data[index] == k:
            if isinstance(node[k], dict):
                return classify(node[k], label, data)
            else:
                return node[k]

def as_rule_str(tree, label, ident=0):
    space_ident = ' '*ident
    s = space_ident
    root = list(tree.keys())[0]
    node = tree[root]
    index = label.index(root)
    for k in node.keys():
        s += 'if ' + label[index] + ' = ' + str(k)
        if isinstance(node[k], dict):
            s += ':\n' + space_ident + as_rule_str(node[k], label, ident + 1)
        else:
            s += ' then ' + str(node[k]) + ('.\n' if ident == 0 else ', ')
            if s[-2:] == ', ':
                s = s[:2]
            s += '\n'
    return s

def find_edges(tree, label, X, Y):
    X.sort()
    Y.sort()
    diagonals = [i for i in set(X).intersection((set(Y)))]
    diagonals.sort()
    L = [classify(tree, label, [d, d]) for d in diagonals]
    low = L.index(False)
    min_x = X[low]
    min_y = Y[low]
    high = L[::-1].index(False)
    max_x = X[len(X)-1 - high]
    max_y = Y[len(Y)-1 - high]
    return (min_x, min_y), (max_x, max_y)

with open("data", "rb") as f:
    data = pickle.load(f)

#data = [[0, 0, False],
#        [-1, 0, True],
#        [1, 0, True],
#        [0, -1, True],
#        [0, 1, True]]

label = ['x', 'y', 'out']
tree = create_tree(data, label)
print(as_rule_str(tree, label))

print(classify(tree, label, [1,1]))

